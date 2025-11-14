/**
 * Server Routes Module
 * 
 * Registers all API endpoints for the MealTracker application.
 * Currently focused on push notification management:
 * - VAPID public key retrieval for client-side subscription
 * - Device subscription registration and updates
 * - Meal time updates with notification settings
 * - Device unsubscription
 * 
 * All endpoints validate request data using Zod schemas before processing.
 * Error handling returns structured JSON responses with appropriate HTTP status codes.
 * 
 * @module server/routes
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getVapidPublicKey, sendPushNotification } from "./push-service";
import { insertPushSubscriptionSchema } from "@shared/schema";

/**
 * Register all API routes for the application
 * 
 * Sets up Express endpoints for:
 * - GET /api/push/vapid-public-key - Retrieve VAPID public key for browser
 * - POST /api/push/subscribe - Register device for push notifications
 * - DELETE /api/push/unsubscribe - Unregister device
 * - POST /api/push/update-meal - Update meal time and notification settings
 * - POST /api/push/reset-badge - Clear app badge
 * 
 * @param {Express} app - Express application instance
 * @returns {Promise<Server>} HTTP server instance ready to listen
 */
export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * GET /api/push/vapid-public-key
   * 
   * Returns the VAPID public key needed for browser push subscription.
   * This key is used client-side to subscribe to the push service.
   * 
   * Response: { publicKey: string }
   * Status: 200 OK | 500 if VAPID key not configured
   */
  app.get("/api/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: getVapidPublicKey() });
  });

  /**
   * POST /api/push/subscribe
   * 
   * Registers a device for push notifications. If the endpoint already exists,
   * updates the subscription instead.
   * 
   * Request body:
   *   - endpoint (string): Unique push service endpoint from browser
   *   - keys (object): Encryption keys {p256dh, auth}
   *   - lastMealTime (number|null): Timestamp of last meal
   *   - quietHoursStart (number|null): Quiet hours start (0-23)
   *   - quietHoursEnd (number|null): Quiet hours end (0-23)
   *   - language (string): 'en', 'de', or 'es'
   * 
   * Response: { success: true, message: string }
   * Status: 200 OK | 400 Bad Request (validation error)
   */
  app.post("/api/push/subscribe", async (req, res) => {
    try {
      // Parse and validate subscription data with schema
      const validated = insertPushSubscriptionSchema.parse({
        endpoint: req.body.endpoint,
        keys: JSON.stringify(req.body.keys),
        lastMealTime: req.body.lastMealTime ?? null,
        quietHoursStart: req.body.quietHoursStart ?? null,
        quietHoursEnd: req.body.quietHoursEnd ?? null,
        language: req.body.language ?? 'en',
      });

      const existing = await storage.getPushSubscriptionByEndpoint(validated.endpoint);
      
      if (existing) {
        await storage.updatePushSubscription(existing.id, {
          keys: validated.keys,
          lastMealTime: validated.lastMealTime,
          quietHoursStart: validated.quietHoursStart,
          quietHoursEnd: validated.quietHoursEnd,
          language: validated.language,
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

  /**
   * DELETE /api/push/unsubscribe
   * 
   * Removes a device from push notifications by endpoint.
   * Safe to call even if endpoint is not registered (idempotent).
   * 
   * Request body:
   *   - endpoint (string): Push service endpoint to remove
   * 
   * Response: { success: true }
   * Status: 200 OK | 400 Bad Request (operation failed)
   */
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

  /**
   * POST /api/push/update-meal
   * 
   * Updates meal time and/or notification settings for a registered device.
   * Validates quiet hours (both must be provided together if one is specified).
   * Used when user changes meal time or preferences in the app.
   * 
   * Request body (all optional, but endpoint required):
   *   - endpoint (string): Push service endpoint (required)
   *   - lastMealTime (number): Meal timestamp in milliseconds
   *   - quietHoursStart (number): Quiet hours start (0-23), must be with end
   *   - quietHoursEnd (number): Quiet hours end (0-23), must be with start
   *   - language (string): 'en', 'de', or 'es'
   * 
   * Response: { success: true }
   * Status: 200 OK | 404 Not Found | 400 Bad Request (validation error)
   */
  app.post("/api/push/update-meal", async (req, res) => {
    try {
      const { endpoint, lastMealTime, quietHoursStart, quietHoursEnd, language } = req.body;
      const subscription = await storage.getPushSubscriptionByEndpoint(endpoint);
      
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      const updateData: any = {};
      
      // Validate and add lastMealTime
      if (lastMealTime !== undefined) {
        updateData.lastMealTime = lastMealTime;
      }
      
      // Validate and add language
      if (language !== undefined) {
        if (!['en', 'de', 'es'].includes(language)) {
          return res.status(400).json({ error: "Language must be 'en', 'de', or 'es'" });
        }
        updateData.language = language;
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

  /**
   * POST /api/push/reset-badge
   * 
   * Clears the app badge (notification counter) on device.
   * Sends a silent push notification with badgeCount: 0.
   * 
   * Request body:
   *   - endpoint (string): Push service endpoint
   * 
   * Response: { success: true }
   * Status: 200 OK | 404 Not Found | 400 Bad Request
   */
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
