import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { OrderItem } from "@shared/schema";

// Track connected clients
const clients = new Map<number, WebSocket>();

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Setup auth first to ensure session is available
  setupAuth(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    try {
      // @ts-ignore - session is added by express-session
      const userId = req.session?.passport?.user;
      if (userId) {
        clients.set(userId, ws);
        console.log(`WebSocket client connected for user ${userId}`);

        ws.on('close', () => {
          clients.delete(userId);
          console.log(`WebSocket client disconnected for user ${userId}`);
        });

        ws.on('error', (error) => {
          console.error(`WebSocket error for user ${userId}:`, error);
          clients.delete(userId);
        });
      }
    } catch (error) {
      console.error('Error in WebSocket connection:', error);
    }
  });

  // Helper to send updates to specific users
  const notifyUser = (userId: number, data: any) => {
    try {
      const client = clients.get(userId);
      if (client?.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
        console.log(`Notification sent to user ${userId}:`, data);
      }
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
    }
  };

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
    try {
      const order = await storage.assignShopper(
        parseInt(req.params.id),
        req.user.id
      );
      // Notify customer of accepted order
      notifyUser(order.customerId, {
        type: 'ORDER_UPDATED',
        order
      });
      res.json(order);
    } catch (error) {
      console.error('Error accepting order:', error);
      res.status(500).json({ message: 'Failed to accept order' });
    }
  });

  app.post("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const order = await storage.updateOrderStatus(
        parseInt(req.params.id),
        req.body.status
      );
      // Notify customer of status change
      notifyUser(order.customerId, {
        type: 'ORDER_UPDATED',
        order
      });
      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  app.post("/api/orders/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const orderId = parseInt(req.params.id);
      const items = req.body.items as OrderItem[];

      const order = await storage.updateOrderItems(orderId, items);
      // Notify customer of items update
      notifyUser(order.customerId, {
        type: 'ORDER_UPDATED',
        order
      });
      res.json(order);
    } catch (error) {
      console.error('Error updating order items:', error);
      res.status(500).json({ message: 'Failed to update order items' });
    }
  });

  app.post("/api/orders/:id/pay", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orderId = parseInt(req.params.id);

    try {
      const order = await storage.processPayment(orderId);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

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

  app.post("/api/shoppers/availability", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.updateUserAvailability(
      req.user.id,
      req.body.isAvailable
    );
    res.json(user);
  });

  return httpServer;
}