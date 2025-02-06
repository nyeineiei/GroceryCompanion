import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

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
  connectionTimeoutMillis: 5000, // increase timeout
  retryInterval: 100, // time between connection retries
  maxRetries: 3 // number of retries before failing
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