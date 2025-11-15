import { type User, type InsertUser, type PushSubscription, type InsertPushSubscription, pushSubscriptions } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  updatePushSubscription(id: string, data: Partial<InsertPushSubscription>): Promise<PushSubscription | undefined>;
  getPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscription | undefined>;
  getAllPushSubscriptions(): Promise<PushSubscription[]>;
  deletePushSubscription(endpoint: string): Promise<void>;
}

/**
 * In-memory implementation for local development.
 *
 * If `process.env.DATABASE_URL` is set, the class delegates push-related
 * operations to the configured database (Drizzle). If not, it stores
 * push subscriptions in-memory so the app can run without a real DB.
 */
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pushSubs: Map<string, PushSubscription>;

  constructor() {
    this.users = new Map();
    this.pushSubs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    if (process.env.DATABASE_URL) {
      const [result] = await db.insert(pushSubscriptions).values(subscription).returning();
      return result;
    }

    const id = randomUUID();
    const created: PushSubscription = { ...subscription, id } as unknown as PushSubscription;
    this.pushSubs.set(created.endpoint, created);
    return created;
  }

  async updatePushSubscription(id: string, data: Partial<InsertPushSubscription>): Promise<PushSubscription | undefined> {
    if (process.env.DATABASE_URL) {
      const [result] = await db.update(pushSubscriptions)
        .set(data)
        .where(eq(pushSubscriptions.id, id))
        .returning();
      return result;
    }

    const item = Array.from(this.pushSubs.values()).find((s) => s.id === id);
    if (!item) return undefined;
    const updated = { ...item, ...data } as PushSubscription;
    this.pushSubs.set(updated.endpoint, updated);
    return updated;
  }

  async getPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscription | undefined> {
    if (process.env.DATABASE_URL) {
      const [result] = await db.select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint));
      return result;
    }

    return this.pushSubs.get(endpoint);
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    if (process.env.DATABASE_URL) {
      return await db.select().from(pushSubscriptions);
    }

    return Array.from(this.pushSubs.values());
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    if (process.env.DATABASE_URL) {
      await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
      return;
    }

    this.pushSubs.delete(endpoint);
  }
}

export const storage = new MemStorage();
