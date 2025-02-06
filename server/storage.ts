import { InsertUser, InsertOrder, InsertReview, User, Order, Review } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private reviews: Map<number, Review>;
  sessionStore: session.Store;
  private currentUserId: number;
  private currentOrderId: number;
  private currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentOrderId = 1;
    this.currentReviewId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, rating: 5.0, isAvailable: false };
    this.users.set(id, user);
    return user;
  }

  async updateUserAvailability(id: number, isAvailable: boolean): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updated = { ...user, isAvailable };
    this.users.set(id, updated);
    return updated;
  }

  async createOrder(order: InsertOrder & { customerId: number }): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = {
      ...order,
      id,
      status: "pending",
      shopperId: null,
      total: 0,
      createdAt: new Date(),
      items: order.items ?? [],
      notes: order.notes ?? null,
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId
    );
  }

  async getOrdersByShopper(shopperId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.shopperId === shopperId
    );
  }

  async getPendingOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.status === "pending"
    );
  }

  async updateOrderStatus(id: number, status: Order["status"]): Promise<Order> {
    const order = await this.getOrder(id);
    if (!order) throw new Error("Order not found");
    
    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }

  async assignShopper(orderId: number, shopperId: number): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");

    const updated: Order = { ...order, shopperId, status: "accepted" as const };
    this.orders.set(orderId, updated);
    return updated;
  }

  async createReview(review: InsertReview & {
    orderId: number;
    fromId: number;
    toId: number;
  }): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = {
      ...review,
      id,
      orderId: review.orderId,
      fromId: review.fromId,
      toId: review.toId,
      comment: review.comment ?? null,
    };
    this.reviews.set(id, newReview);

    // Update user rating
    const userReviews = await this.getReviewsByUser(review.toId);
    const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / userReviews.length;

    const user = await this.getUser(review.toId);
    if (user) {
      const updated = { ...user, rating: avgRating };
      this.users.set(user.id, updated);
    }

    return newReview;
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.toId === userId
    );
  }
}

export const storage = new MemStorage();