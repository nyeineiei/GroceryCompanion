import dotenv from 'dotenv';
dotenv.config(); // Make sure the environment variables are loaded

// Now access the environment variable
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema.ts";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the pool with better settings for connection management and resilience
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // reduce max connections to prevent overload
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5001 // increase timeout
});

// Add event listeners for connection issues
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process, let the application handle reconnection
  pool.end().catch(console.error);
});

pool.on('connect', () => {
  console.log('New client connected to database');
});

export const db = drizzle({ client: pool, schema });

// Cleanup function for graceful shutdown
export async function cleanup() {
  try {
    await pool.end();
    console.log('Database pool has ended');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
}