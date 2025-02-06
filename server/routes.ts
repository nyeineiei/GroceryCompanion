import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { OrderItem } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Order routes
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const order = await storage.createOrder({
      ...req.body,
      customerId: req.user.id,
    });
    res.json(order);
  });

  app.get("/api/orders/customer", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orders = await storage.getOrdersByCustomer(req.user.id);
    res.json(orders);
  });

  app.get("/api/orders/shopper", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orders = await storage.getOrdersByShopper(req.user.id);
    res.json(orders);
  });

  app.get("/api/orders/pending", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orders = await storage.getPendingOrders();
    res.json(orders);
  });

  app.post("/api/orders/:id/accept", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const order = await storage.assignShopper(
      parseInt(req.params.id),
      req.user.id
    );
    res.json(order);
  });

  app.post("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const order = await storage.updateOrderStatus(
      parseInt(req.params.id),
      req.body.status
    );
    res.json(order);
  });

  // New shopping routes
  app.post("/api/orders/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orderId = parseInt(req.params.id);
    const items = req.body.items as OrderItem[];

    const order = await storage.updateOrderItems(orderId, items);
    res.json(order);
  });

  app.post("/api/orders/:id/pay", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orderId = parseInt(req.params.id);

    try {
      const order = await storage.processPayment(orderId);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const review = await storage.createReview({
      ...req.body,
      fromId: req.user.id,
    });
    res.json(review);
  });

  app.get("/api/reviews/:userId", async (req, res) => {
    const reviews = await storage.getReviewsByUser(parseInt(req.params.userId));
    res.json(reviews);
  });

  // Shopper availability
  app.post("/api/shoppers/availability", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.updateUserAvailability(
      req.user.id,
      req.body.isAvailable
    );
    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}