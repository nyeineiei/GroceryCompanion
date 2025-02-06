import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["customer", "shopper"] }).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  isAvailable: boolean("is_available").default(false),
  rating: real("rating").default(5.0),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => users.id),
  shopperId: integer("shopper_id").references(() => users.id),
  status: text("status", { 
    enum: ["pending", "accepted", "shopping", "delivering", "completed"] 
  }).default("pending"),
  items: text("items").array(),
  notes: text("notes"),
  total: real("total").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  fromId: integer("from_id").references(() => users.id),
  toId: integer("to_id").references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  phone: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  items: true,
  notes: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  rating: true,
  comment: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Review = typeof reviews.$inferSelect;
