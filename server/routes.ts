import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { seed } from "./seed";

import { setupAuth as setupReplitAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed database if empty
  seed().catch(console.error);

  // Set up Replit Auth
  await setupReplitAuth(app);
  registerAuthRoutes(app);

  // === AUTHENTICATION API ===
  
  app.get(api.auth.user.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const sessionUser = req.user as any;
    const userId = sessionUser.id;
    
    // Get full user from our DB
    const user = await storage.getUser(userId);
    
    if (!user) return res.sendStatus(401);

    const couple = await storage.getUserCouple(user.id);
    res.json({ ...user, coupleId: couple?.id || null });
  });

  // === COUPLE API ===

  app.post(api.couple.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    // Check if user already has a couple
    const existing = await storage.getUserCouple(user.id);
    if (existing) return res.status(400).json({ message: "Already in a couple" });

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const couple = await storage.createCouple(inviteCode);
    
    await storage.addCoupleMember(user.id, couple.id, "admin");
    await storage.logActivity({
      coupleId: couple.id,
      userId: user.id,
      action: "created_couple",
      details: "Created the workspace"
    });

    res.status(201).json(couple);
  });

  app.post(api.couple.join.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    const { inviteCode } = api.couple.join.input.parse(req.body);
    const couple = await storage.getCoupleByInviteCode(inviteCode);

    if (!couple) return res.status(400).json({ message: "Invalid invite code" });

    // Check capacity
    const members = await storage.getCoupleMembers(couple.id);
    if (members.length >= 2) return res.status(400).json({ message: "Couple workspace is full" });

    await storage.addCoupleMember(user.id, couple.id, "member");
    await storage.logActivity({
      coupleId: couple.id,
      userId: user.id,
      action: "joined_couple",
      details: "Joined the workspace"
    });

    res.json(couple);
  });

  app.get(api.couple.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    const couple = await storage.getUserCouple(user.id);
    if (!couple) return res.status(404).json({ message: "No couple workspace found" });

    const members = await storage.getCoupleMembers(couple.id);
    res.json({ ...couple, members });
  });

  // === TODO API ===

  app.get(api.todos.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const couple = await storage.getUserCouple(user.id);
    if (!couple) return res.status(400).json({ message: "Not in a couple" });

    const todos = await storage.getTodos(couple.id);
    res.json(todos);
  });

  app.post(api.todos.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const couple = await storage.getUserCouple(user.id);
    if (!couple) return res.status(400).json({ message: "Not in a couple" });

    const input = api.todos.create.input.parse(req.body);
    const todo = await storage.createTodo({
      ...input,
      coupleId: couple.id,
      createdBy: user.id,
    });

    await storage.logActivity({
      coupleId: couple.id,
      userId: user.id,
      action: "create_todo",
      details: `Created task: ${todo.title}`
    });

    res.status(201).json(todo);
  });

  app.patch(api.todos.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const couple = await storage.getUserCouple(user.id);
    if (!couple) return res.status(400).json({ message: "Not in a couple" });

    const id = parseInt(req.params.id);
    const input = api.todos.update.input.parse(req.body);
    const todo = await storage.updateTodo(id, input);

    if (input.status === "completed") {
      await storage.logActivity({
        coupleId: couple.id,
        userId: user.id,
        action: "complete_todo",
        details: `Completed task: ${todo.title}`
      });
    }

    res.json(todo);
  });

  app.delete(api.todos.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    await storage.deleteTodo(id);
    res.json({ message: "Deleted" });
  });

  app.post(api.comments.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    
    const todoId = parseInt(req.params.id);
    const { content } = api.comments.create.input.parse(req.body);
    
    const comment = await storage.createComment({
      todoId,
      userId: user.id,
      content
    });
    
    res.status(201).json(comment);
  });

  app.get(api.activity.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const couple = await storage.getUserCouple(user.id);
    if (!couple) return res.status(400).json({ message: "Not in a couple" });

    const logs = await storage.getActivityLogs(couple.id);
    res.json(logs);
  });

  return httpServer;
}
