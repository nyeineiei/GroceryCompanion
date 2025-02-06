import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
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

// Define the OrderItem type for tracking individual items
export type OrderItem = {
  name: string;
  price: number;
  purchased: boolean;
  quantity: number;
};

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => users.id),
  shopperId: integer("shopper_id").references(() => users.id),
  status: text("status", { 
    enum: ["pending", "accepted", "shopping", "delivering", "completed", "paid"] 
  }).default("pending"),
  items: jsonb("items").$type<OrderItem[]>().default([]),
  notes: text("notes"),
  total: real("total").default(0),
  serviceFee: real("service_fee").default(5.00), // Fixed service fee
  isPaid: boolean("is_paid").default(false),
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

// Update schemas to include new fields
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  phone: true,
});

export const orderItemSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
  purchased: z.boolean(),
  quantity: z.number().int().min(1),
});

export const insertOrderSchema = createInsertSchema(orders)
  .extend({
    items: z.array(orderItemSchema),
  })
  .pick({
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