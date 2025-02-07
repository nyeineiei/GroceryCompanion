import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth.ts";
import { storage } from "./storage.ts";
import { OrderItem } from "@shared/schema.js";

// Track connected clients
const clients = new Map<number, WebSocket>();

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

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

  // Order routes with proper role checks
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "customer") return res.sendStatus(403);

    try {
      const order = await storage.createOrder({
        ...req.body,
        customerId: req.user.id,
      });
      res.json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  app.get("/api/orders/customer", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthorized access attempt to /api/orders/customer");
      return res.sendStatus(401);
    }
    if (req.user.role !== "customer") {
      console.log(`Invalid role access attempt to /api/orders/customer: ${req.user.role}`);
      return res.sendStatus(403);
    }

    try {
      console.log(`Fetching orders for customer ${req.user.id}`);
      const orders = await storage.getOrdersByCustomer(req.user.id);
      console.log(`Found ${orders.length} orders for customer ${req.user.id}:`, orders);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  app.get("/api/orders/shopper", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "shopper") return res.sendStatus(403);

    try {
      const orders = await storage.getOrdersByShopper(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching shopper orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  app.get("/api/orders/pending", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "shopper") return res.sendStatus(403);
    if (!req.user.isAvailable) return res.sendStatus(403);

    try {
      const orders = await storage.getPendingOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      res.status(500).json({ message: 'Failed to fetch pending orders' });
    }
  });

  app.post("/api/orders/:id/accept", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "shopper") return res.sendStatus(403);

    try {
      const { location } = req.body;

      // Validate location data
      if (!location || !location.latitude || !location.longitude) {
        return res.status(400).json({ 
          message: "Please enable location access. You must be at a grocery store to accept orders." 
        });
      }

      console.log('Accepting order with location:', location);

      const order = await storage.assignShopper(
        parseInt(req.params.id),
        req.user.id,
        location
      );

      console.log('Order updated with delivery estimate:', order.estimatedDeliveryTime);

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
    if (req.user.role !== "shopper") return res.sendStatus(403);

    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order || order.shopperId !== req.user.id) {
        return res.sendStatus(403);
      }

      const updatedOrder = await storage.updateOrderStatus(
        orderId,
        req.body.status
      );
      // Notify customer of status change
      notifyUser(updatedOrder.customerId, {
        type: 'ORDER_UPDATED',
        order: updatedOrder
      });
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  app.post("/api/orders/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "shopper") return res.sendStatus(403);

    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order || order.shopperId !== req.user.id) {
        return res.sendStatus(403);
      }

      const items = req.body.items as OrderItem[];
      const updatedOrder = await storage.updateOrderItems(orderId, items);
      // Notify customer of items update
      notifyUser(updatedOrder.customerId, {
        type: 'ORDER_UPDATED',
        order: updatedOrder
      });
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order items:', error);
      res.status(500).json({ message: 'Failed to update order items' });
    }
  });

  app.post("/api/orders/:id/pay", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "customer") return res.sendStatus(403);

    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order || order.customerId !== req.user.id) {
        return res.sendStatus(403);
      }

      const updatedOrder = await storage.processPayment(orderId);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const review = await storage.createReview({
        ...req.body,
        fromId: req.user.id,
      });
      res.json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Failed to create review' });
    }
  });

  app.get("/api/reviews/:userId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByUser(parseInt(req.params.userId));
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  app.post("/api/shoppers/availability", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "shopper") return res.sendStatus(403);

    try {
      const user = await storage.updateUserAvailability(
        req.user.id,
        req.body.isAvailable
      );
      res.json(user);
    } catch (error) {
      console.error('Error updating shopper availability:', error);
      res.status(500).json({ message: 'Failed to update availability' });
    }
  });
  // Add this new route after the existing order routes
  app.patch("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "customer") return res.sendStatus(403);

    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);

      // Check if order exists and belongs to the customer
      if (!order || order.customerId !== req.user.id) {
        return res.sendStatus(403);
      }

      // Don't allow editing if order is already accepted
      if (order.status !== "pending") {
        return res.status(400).json({ message: "Cannot edit order after it has been accepted" });
      }

      const updatedOrder = await storage.updateOrder(orderId, {
        items: req.body.items,
        notes: req.body.notes
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: 'Failed to update order' });
    }
  });

  app.get("/api/orders/customer/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "customer") return res.sendStatus(403);

    try {
      const orders = await storage.getCompletedOrdersByCustomer(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching customer order history:', error);
      res.status(500).json({ message: 'Failed to fetch order history' });
    }
  });

  app.get("/api/orders/shopper/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "shopper") return res.sendStatus(403);

    try {
      const orders = await storage.getCompletedOrdersByShopper(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching shopper order history:', error);
      res.status(500).json({ message: 'Failed to fetch order history' });
    }
  });

  return httpServer;
}