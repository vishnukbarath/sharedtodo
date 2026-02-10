import { db } from "./db";
import {
  users, couples, coupleMembers, todos, comments, activityLogs,
  type User, type InsertUser, type Couple, type Todo, type InsertTodo,
  type Comment, type ActivityLog
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Auth & Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(email: string): Promise<User | undefined>; // using email as username
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;

  // Couple
  createCouple(inviteCode: string): Promise<Couple>;
  getCoupleByInviteCode(code: string): Promise<Couple | undefined>;
  getCoupleById(id: number): Promise<Couple | undefined>;
  addCoupleMember(userId: number, coupleId: number, role: string): Promise<void>;
  getCoupleMembers(coupleId: number): Promise<User[]>;
  getUserCouple(userId: number): Promise<Couple | undefined>;

  // Todos
  getTodos(coupleId: number): Promise<(Todo & { comments: Comment[] })[]>;
  getTodo(id: number): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, updates: Partial<InsertTodo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;

  // Comments
  createComment(comment: { todoId: number; userId: number; content: string }): Promise<Comment>;
  getComments(todoId: number): Promise<Comment[]>;

  // Activity
  logActivity(log: { coupleId: number; userId: number; action: string; details: string }): Promise<void>;
  getActivityLogs(coupleId: number): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: "sessions"
    });
  }

  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Couple
  async createCouple(inviteCode: string): Promise<Couple> {
    const [newCouple] = await db.insert(couples).values({ inviteCode }).returning();
    return newCouple;
  }

  async getCoupleByInviteCode(code: string): Promise<Couple | undefined> {
    const [couple] = await db.select().from(couples).where(eq(couples.inviteCode, code));
    return couple;
  }

  async getCoupleById(id: number): Promise<Couple | undefined> {
    const [couple] = await db.select().from(couples).where(eq(couples.id, id));
    return couple;
  }

  async addCoupleMember(userId: number, coupleId: number, role: string): Promise<void> {
    await db.insert(coupleMembers).values({ userId, coupleId, role });
  }

  async getCoupleMembers(coupleId: number): Promise<User[]> {
    const members = await db.select({ user: users })
      .from(coupleMembers)
      .innerJoin(users, eq(coupleMembers.userId, users.id))
      .where(eq(coupleMembers.coupleId, coupleId));
    return members.map(m => m.user);
  }

  async getUserCouple(userId: number): Promise<Couple | undefined> {
    const [member] = await db.select()
      .from(coupleMembers)
      .where(eq(coupleMembers.userId, userId));
    
    if (!member) return undefined;
    return this.getCoupleById(member.coupleId);
  }

  // Todos
  async getTodos(coupleId: number): Promise<(Todo & { comments: Comment[] })[]> {
    const todoList = await db.select().from(todos)
      .where(eq(todos.coupleId, coupleId))
      .orderBy(desc(todos.createdAt));
    
    // Fetch comments for each todo (could be optimized with a join, but this is simple)
    const result = await Promise.all(todoList.map(async (todo) => {
      const comments = await this.getComments(todo.id);
      return { ...todo, comments };
    }));

    return result;
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    const [todo] = await db.select().from(todos).where(eq(todos.id, id));
    return todo;
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const [newTodo] = await db.insert(todos).values(todo).returning();
    return newTodo;
  }

  async updateTodo(id: number, updates: Partial<InsertTodo>): Promise<Todo> {
    const [updated] = await db.update(todos)
      .set(updates)
      .where(eq(todos.id, id))
      .returning();
    return updated;
  }

  async deleteTodo(id: number): Promise<void> {
    await db.delete(todos).where(eq(todos.id, id));
  }

  // Comments
  async createComment(comment: { todoId: number; userId: number; content: string }): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getComments(todoId: number): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.todoId, todoId))
      .orderBy(comments.createdAt);
  }

  // Activity
  async logActivity(log: { coupleId: number; userId: number; action: string; details: string }): Promise<void> {
    await db.insert(activityLogs).values(log);
  }

  async getActivityLogs(coupleId: number): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs)
      .where(eq(activityLogs.coupleId, coupleId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(20);
  }
}

export const storage = new DatabaseStorage();
