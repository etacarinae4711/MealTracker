import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getVapidPublicKey, sendPushNotification } from "./push-service";
import { insertPushSubscriptionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: getVapidPublicKey() });
  });

  app.post("/api/push/subscribe", async (req, res) => {
    try {
      const validated = insertPushSubscriptionSchema.parse({
        endpoint: req.body.endpoint,
        keys: JSON.stringify(req.body.keys),
        lastMealTime: req.body.lastMealTime || null,
        lastDailyReminder: null,
      });

      const existing = await storage.getPushSubscriptionByEndpoint(validated.endpoint);
      
      if (existing) {
        await storage.updatePushSubscription(existing.id, {
          keys: validated.keys,
          lastMealTime: validated.lastMealTime,
        });
        return res.json({ success: true, message: "Subscription updated" });
      }

      await storage.createPushSubscription(validated);
      res.json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
      console.error("Subscribe error:", error);
      res.status(400).json({ error: "Failed to subscribe" });
    }
  });

  app.delete("/api/push/unsubscribe", async (req, res) => {
    try {
      const { endpoint } = req.body;
      await storage.deletePushSubscription(endpoint);
      res.json({ success: true });
    } catch (error) {
      console.error("Unsubscribe error:", error);
      res.status(400).json({ error: "Failed to unsubscribe" });
    }
  });

  app.post("/api/push/update-meal", async (req, res) => {
    try {
      const { endpoint, lastMealTime } = req.body;
      const subscription = await storage.getPushSubscriptionByEndpoint(endpoint);
      
      if (subscription) {
        await storage.updatePushSubscription(subscription.id, { lastMealTime });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Subscription not found" });
      }
    } catch (error) {
      console.error("Update meal error:", error);
      res.status(400).json({ error: "Failed to update meal time" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
