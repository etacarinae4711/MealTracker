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

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
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
    const [result] = await db.insert(pushSubscriptions).values(subscription).returning();
    return result;
  }

  async updatePushSubscription(id: string, data: Partial<InsertPushSubscription>): Promise<PushSubscription | undefined> {
    const [result] = await db.update(pushSubscriptions)
      .set(data)
      .where(eq(pushSubscriptions.id, id))
      .returning();
    return result;
  }

  async getPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscription | undefined> {
    const [result] = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
    return result;
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    return await db.select().from(pushSubscriptions);
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }
}

export const storage = new MemStorage();
