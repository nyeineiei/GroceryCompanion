import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.ts"; 
import { setupVite } from "./vite.ts";  // Only import setupVite as needed
import { db, pool, cleanup } from "./db.ts";
import { setupAuth } from "./auth.ts";
import { Server } from "http";
import session from 'express-session'; // Import the express-session package

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set in the environment variables.");
}

console.log("Database URL:", databaseUrl);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add session middleware with secret from .env
app.use(session({
  secret: process.env.SESSION_SECRET!, // Use the secret from .env, assert it's non-nullable
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Secure cookie only in production
}));

// Add CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      console.log(logLine);  // Use console.log directly for logging
    }
  });

  next();
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

let server: Server;

async function startServer() {
  try {
    // Test database connection
    const client = await pool.connect();
    client.release();
    console.log("Database connection successful");

    // Setup auth before routes
    setupAuth(app);

    // Register API routes
    server = registerRoutes(app);

    // Setup Vite for dev or serve static for production
    if (app.get("env") === "development") {
      await setupVite(app, server);  // Vite setup
      console.log("Vite middleware setup complete");
    } else {
      // Serve static files for production
      const distPath = path.resolve(__dirname, "public");
      app.use(express.static(distPath));
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
      console.log("Static file serving setup complete");
    }

    const PORT = Number(process.env.PORT || 5001); // Updated to 5001
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await cleanup();
    process.exit(1);
  }
}

// Graceful shutdown
["SIGTERM", "SIGINT"].forEach((signal) =>
  process.on(signal, async () => {
    console.log(`Received ${signal}. Cleaning up...`);
    if (server) server.close(() => console.log("HTTP server closed"));
    await cleanup();
    process.exit(0);
  })
);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start server
startServer().catch(async (error) => {
  console.error("Failed to start server:", error);
  await cleanup();
  process.exit(1);
});
