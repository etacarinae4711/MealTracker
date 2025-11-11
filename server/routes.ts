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
      // Parse and validate subscription data with schema
      const validated = insertPushSubscriptionSchema.parse({
        endpoint: req.body.endpoint,
        keys: JSON.stringify(req.body.keys),
        lastMealTime: req.body.lastMealTime ?? null,
        lastDailyReminder: null,
        quietHoursStart: req.body.quietHoursStart ?? null,
        quietHoursEnd: req.body.quietHoursEnd ?? null,
      });

      const existing = await storage.getPushSubscriptionByEndpoint(validated.endpoint);
      
      if (existing) {
        await storage.updatePushSubscription(existing.id, {
          keys: validated.keys,
          lastMealTime: validated.lastMealTime,
          quietHoursStart: validated.quietHoursStart,
          quietHoursEnd: validated.quietHoursEnd,
        });
        return res.json({ success: true, message: "Subscription updated" });
      }

      await storage.createPushSubscription(validated);
      res.json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
      console.error("Subscribe error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Failed to subscribe" });
      }
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
      const { endpoint, lastMealTime, quietHoursStart, quietHoursEnd } = req.body;
      const subscription = await storage.getPushSubscriptionByEndpoint(endpoint);
      
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      const updateData: any = {};
      
      // Validate and add lastMealTime
      if (lastMealTime !== undefined) {
        updateData.lastMealTime = lastMealTime;
      }
      
      // Validate quiet hours if provided
      if (quietHoursStart !== undefined || quietHoursEnd !== undefined) {
        const start = quietHoursStart;
        const end = quietHoursEnd;
        
        // Both must be provided together
        if (start === undefined || end === undefined) {
          return res.status(400).json({ error: "Both quietHoursStart and quietHoursEnd must be provided" });
        }
        
        // Validate range (0-23)
        if (typeof start !== 'number' || typeof end !== 'number' || 
            start < 0 || start > 23 || end < 0 || end > 23) {
          return res.status(400).json({ error: "Quiet hours must be between 0 and 23" });
        }
        
        // Validate start != end
        if (start === end) {
          return res.status(400).json({ error: "Quiet hours start and end must be different" });
        }
        
        updateData.quietHoursStart = start;
        updateData.quietHoursEnd = end;
      }
      
      await storage.updatePushSubscription(subscription.id, updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("Update meal error:", error);
      res.status(400).json({ error: "Failed to update meal time" });
    }
  });

  app.post("/api/push/reset-badge", async (req, res) => {
    try {
      const { endpoint } = req.body;
      const subscription = await storage.getPushSubscriptionByEndpoint(endpoint);
      
      if (subscription) {
        await sendPushNotification(subscription, {
          title: "",
          body: "",
          silent: true,
          badgeCount: 0,
        });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Subscription not found" });
      }
    } catch (error) {
      console.error("Reset badge error:", error);
      res.status(400).json({ error: "Failed to reset badge" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
