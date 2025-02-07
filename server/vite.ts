import { Express } from "express";
import { Server } from "http";
import path from "path"; // Import path module
import fs from "fs"; // Import fs module
import { nanoid } from "nanoid"; // Import nanoid for generating unique IDs
import { createServer as createViteServer } from "vite"; // Import createViteServer from vite

export async function setupVite(app: Express, server: Server) {
  // Ensure that Vite is properly configured for development environment
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
    },
  });

  // Use basic console logging
  const viteLogger = {
    info: (msg: string) => console.info(msg),
    warn: (msg: string) => console.warn(msg),
    error: (msg: string) => console.error(msg),
  };

  // Add Vite middleware for development
  app.use(vite.middlewares);

  // Setup custom logging behavior for Vite (optional)
  viteLogger.info("Vite server running in middleware mode");

  // Serve the HTML page for the client-side app
  app.use("*", async (req, res, next) => {
    try {
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      template = template.replace(
        '<div id="app"></div>',
        `<div id="app"></div><script src="/src/main.tsx?v=${nanoid()}"></script>`
      );

      res.setHeader("Content-Type", "text/html");
      res.send(template);
    } catch (error) {
      next(error);
    }
  });
}
