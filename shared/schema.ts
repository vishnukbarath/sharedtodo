import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"), // Nullable for OAuth users
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const couples = pgTable("couples", {
  id: serial("id").primaryKey(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coupleMembers = pgTable("couple_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  coupleId: integer("couple_id").notNull().references(() => couples.id),
  role: text("role").notNull(), // 'admin' or 'member' (initial creator is admin)
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  coupleId: integer("couple_id").notNull().references(() => couples.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // 'pending', 'completed'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  dueDate: timestamp("due_date"),
  assignedTo: text("assigned_to").default("both"), // 'him', 'her', 'both' - mapped to specific users logic in app
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  todoId: integer("todo_id").notNull().references(() => todos.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  coupleId: integer("couple_id").notNull().references(() => couples.id),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // 'create_todo', 'complete_todo', 'join_couple'
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  coupleMember: one(coupleMembers, {
    fields: [users.id],
    references: [coupleMembers.userId],
  }),
  comments: many(comments),
  createdTodos: many(todos),
}));

export const couplesRelations = relations(couples, ({ many }) => ({
  members: many(coupleMembers),
  todos: many(todos),
  logs: many(activityLogs),
}));

export const coupleMembersRelations = relations(coupleMembers, ({ one }) => ({
  user: one(users, {
    fields: [coupleMembers.userId],
    references: [users.id],
  }),
  couple: one(couples, {
    fields: [coupleMembers.coupleId],
    references: [couples.id],
  }),
}));

export const todosRelations = relations(todos, ({ one, many }) => ({
  couple: one(couples, {
    fields: [todos.coupleId],
    references: [couples.id],
  }),
  author: one(users, {
    fields: [todos.createdBy],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  todo: one(todos, {
    fields: [comments.todoId],
    references: [todos.id],
  }),
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// === SCHEMA & TYPES ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCoupleSchema = createInsertSchema(couples).omit({ id: true, createdAt: true });
export const insertTodoSchema = createInsertSchema(todos).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type Couple = typeof couples.$inferSelect;
export type Todo = typeof todos.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// API TYPES
export type AuthResponse = User & { coupleId?: number | null };
