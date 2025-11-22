/**
 * db.ts
 * 
 * Database connection configuration
 * Uses Neon HTTP driver for Replit compatibility
 * 
 * Note: Transactions are not supported with neon-http driver
 * Alternative: Neon WebSocket driver supports transactions but fails in Replit environment
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Initialize Neon HTTP connection (Replit-compatible)
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle database instance
export const db = drizzle(sql, { schema });
