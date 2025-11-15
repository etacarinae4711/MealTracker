/**
 * Database Module
 *
 * Initializes and exports the Drizzle ORM database connection.
 * If `DATABASE_URL` is not present and we're in `development`, a small
 * lightweight dummy object is exported to avoid import-time failures.
 *
 * Environment requirement:
 *   - DATABASE_URL: PostgreSQL connection string (recommended for production)
 *
 * Exported:
 *   - db: Drizzle instance or a fallback stub (development only)
 *
 * @module server/db
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Exported binding assigned below depending on environment.
// eslint-disable-next-line import/no-mutable-exports, @typescript-eslint/no-explicit-any
export let db: any;

if (process.env.DATABASE_URL) {
  // Initialize Neon connection with DATABASE_URL
  const sql = neon(process.env.DATABASE_URL);
  // Drizzle ORM database instance - production / normal development.
  db = drizzle(sql, { schema });
} else {
  if (process.env.NODE_ENV !== "production") {
    // Minimal stub implementation for development.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stub: any = {
      insert: () => ({ values: () => ({ returning: async () => [] }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: async () => [] }) }) }),
      select: () => ({ from: () => ({ where: async () => [] }) }),
      delete: () => ({ where: async () => { /* noop */ } }),
    };
    db = stub;
    // Log a visible warning so devs notice the fallback
    // eslint-disable-next-line no-console
    console.warn("WARNING: No DATABASE_URL set — using in-memory DB stub (development only).");
  } else {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
}
