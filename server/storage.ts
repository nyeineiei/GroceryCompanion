import { users, orders, reviews, type User, type Order, type Review, type InsertUser, type InsertOrder, type InsertReview, OrderItem } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAvailability(id: number, isAvailable: boolean): Promise<User>;

  // Order operations
  createOrder(order: InsertOrder & { customerId: number }): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  getOrdersByShopper(shopperId: number): Promise<Order[]>;
  getPendingOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: Order["status"]): Promise<Order>;
  assignShopper(orderId: number, shopperId: number): Promise<Order>;
  updateOrderItems(orderId: number, items: OrderItem[]): Promise<Order>;
  processPayment(orderId: number): Promise<Order>;
  updateOrder(id: number, updates: { items: OrderItem[], notes?: string }): Promise<Order>;

  // Review operations
  createReview(review: InsertReview & { 
    orderId: number;
    fromId: number;
    toId: number;
  }): Promise<Review>;
  getReviewsByUser(userId: number): Promise<Review[]>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserAvailability(id: number, isAvailable: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isAvailable })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Order operations
  async createOrder(order: InsertOrder & { customerId: number }): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values({
        customerId: order.customerId,
        items: order.items,
        notes: order.notes ?? null,
      })
      .returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));

    // Add user-specific order numbers
    return customerOrders.map((order, index) => ({
      ...order,
      displayOrderNumber: customerOrders.length - index, // Reverse index since orders are sorted by desc
    }));
  }

  async getOrdersByShopper(shopperId: number): Promise<Order[]> {
    const shopperOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.shopperId, shopperId))
      .orderBy(desc(orders.createdAt));

    // Add sequential numbers for shopper's orders
    return shopperOrders.map((order, index) => ({
      ...order,
      displayOrderNumber: shopperOrders.length - index
    }));
  }

  async getPendingOrders(): Promise<Order[]> {
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.status, "pending"))
      .orderBy(desc(orders.createdAt));

    // Add sequential numbers for pending orders
    return pendingOrders.map((order, index) => ({
      ...order,
      displayOrderNumber: pendingOrders.length - index
    }));
  }

  async updateOrderStatus(id: number, status: Order["status"]): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async assignShopper(orderId: number, shopperId: number): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ shopperId, status: "accepted" })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async updateOrderItems(orderId: number, items: OrderItem[]): Promise<Order> {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [order] = await db
      .update(orders)
      .set({ items, total })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async processPayment(orderId: number): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ isPaid: true, status: "paid" })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async updateOrder(
    id: number,
    updates: { items: OrderItem[], notes?: string }
  ): Promise<Order> {
    const total = updates.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const [order] = await db
      .update(orders)
      .set({
        items: updates.items,
        notes: updates.notes ?? null,
        total
      })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Review operations
  async createReview(review: InsertReview & {
    orderId: number;
    fromId: number;
    toId: number;
  }): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();

    // Update user rating
    const userReviews = await this.getReviewsByUser(review.toId);
    const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / userReviews.length;

    await db
      .update(users)
      .set({ rating: avgRating })
      .where(eq(users.id, review.toId));

    return newReview;
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.toId, userId));
  }
}

export const storage = new DatabaseStorage();