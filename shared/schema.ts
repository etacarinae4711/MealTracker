import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpoint: text("endpoint").notNull().unique(),
  keys: text("keys").notNull(),
  lastMealTime: bigint("last_meal_time", { mode: "number" }),
  lastDailyReminder: timestamp("last_daily_reminder"),
  quietHoursStart: integer("quiet_hours_start"),
  quietHoursEnd: integer("quiet_hours_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const basePushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertPushSubscriptionSchema = basePushSubscriptionSchema.refine(
  (data) => {
    // If quiet hours are set, validate them
    const start = data.quietHoursStart;
    const end = data.quietHoursEnd;
    
    // If only one is set, that's invalid
    if ((start === null || start === undefined) !== (end === null || end === undefined)) {
      return false;
    }
    
    // If both are set, validate them
    if (start !== null && start !== undefined && end !== null && end !== undefined) {
      // Both must be in range 0-23
      if (start < 0 || start > 23 || end < 0 || end > 23) return false;
      // Start must not equal end
      if (start === end) return false;
    }
    
    return true;
  },
  {
    message: "Quiet hours must be between 0-23 and start must not equal end",
  }
);

// Schema for updating push subscriptions (all fields optional except endpoint identification)
export const updatePushSubscriptionSchema = basePushSubscriptionSchema.partial();

export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type UpdatePushSubscription = z.infer<typeof updatePushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
