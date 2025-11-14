/**
 * Database Module
 * 
 * Initializes and exports the Drizzle ORM database connection.
 * 
 * Uses Neon (PostgreSQL) as the database provider with Drizzle ORM
 * for type-safe database operations.
 * 
 * Environment requirement:
 *   - DATABASE_URL: PostgreSQL connection string (required)
 * 
 * Exported:
 *   - db: Drizzle instance for running queries
 * 
 * @module server/db
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Initialize Neon connection with DATABASE_URL
const sql = neon(process.env.DATABASE_URL);

/**
 * Drizzle ORM database instance
 * 
 * Use this to run queries against the PostgreSQL database.
 * All tables are imported from @shared/schema.
 * 
 * Example:
 *   const users = await db.select().from(users).limit(10);
 */
export const db = drizzle(sql, { schema });
