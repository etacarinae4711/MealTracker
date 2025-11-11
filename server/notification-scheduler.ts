import cron from "node-cron";
import { storage } from "./storage";
import { sendPushNotification } from "./push-service";
import type { PushSubscription } from "@shared/schema";

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

const lastNotificationSent = new Map<string, number>();

/**
 * Checks if current time is within quiet hours for a subscription
 * 
 * Quiet hours prevent notifications from being sent during specified time periods.
 * This function handles edge cases like:
 * - Quiet hours spanning midnight (e.g., 22:00 - 08:00)
 * - Missing quiet hours configuration (returns false - not in quiet hours)
 * - Invalid quiet hours (start === end) - returns false and logs warning
 * 
 * @param subscription - Push subscription with quiet hours settings
 * @returns true if currently within quiet hours, false otherwise
 */
function isInQuietHours(subscription: PushSubscription): boolean {
  // If no quiet hours configured, never in quiet hours
  if (subscription.quietHoursStart === null || subscription.quietHoursEnd === null) {
    return false;
  }

  const start = subscription.quietHoursStart;
  const end = subscription.quietHoursEnd;

  // Defensive: Check for invalid configuration (should be prevented by validation)
  if (start === end || start < 0 || start > 23 || end < 0 || end > 23) {
    console.warn(`[Quiet Hours] Invalid configuration for ${subscription.id.substring(0, 8)}: start=${start}, end=${end}`);
    return false; // Don't block notifications if config is invalid
  }

  const now = new Date();
  const currentHour = now.getHours();

  // Handle edge case: quiet hours span midnight (e.g., 22:00 - 08:00)
  if (start > end) {
    // We're in quiet hours if: currentHour >= start OR currentHour < end
    return currentHour >= start || currentHour < end;
  }

  // Normal case: quiet hours within same day (e.g., 01:00 - 06:00)
  return currentHour >= start && currentHour < end;
}

export function startNotificationScheduler() {
  // Stündlicher Badge-Update (stille Push)
  cron.schedule("0 * * * *", async () => {
    try {
      const subscriptions = await storage.getAllPushSubscriptions();
      const now = Date.now();
      console.log(`[Hourly Badge] Updating badges for ${subscriptions.length} subscriptions at ${new Date().toISOString()}`);

      for (const subscription of subscriptions) {
        if (!subscription.lastMealTime) {
          console.log(`[Hourly Badge] Skipping ${subscription.id.substring(0, 8)} - no lastMealTime`);
          continue;
        }

        const timeSinceLastMeal = now - subscription.lastMealTime;
        const hoursAgo = Math.min(Math.floor(timeSinceLastMeal / (60 * 60 * 1000)), 99);
        
        console.log(`[Hourly Badge] Sending badge ${hoursAgo} to ${subscription.id.substring(0, 8)}`);
        const success = await sendPushNotification(subscription, {
          title: "",
          body: "",
          silent: true,
          badgeCount: hoursAgo,
        });

        if (success) {
          console.log(`[Hourly Badge] ✅ Badge updated to ${hoursAgo} for ${subscription.id.substring(0, 8)}`);
        } else {
          console.log(`[Hourly Badge] ❌ Badge update failed for ${subscription.id.substring(0, 8)}`);
        }
      }
    } catch (error) {
      console.error("Error in hourly badge scheduler:", error);
    }
  });

  // 3-Stunden-Erinnerung (mit Badge)
  cron.schedule("*/5 * * * *", async () => {
    try {
      const subscriptions = await storage.getAllPushSubscriptions();
      const now = Date.now();
      console.log(`[3h Scheduler] Checking ${subscriptions.length} subscriptions at ${new Date().toISOString()}`);

      for (const subscription of subscriptions) {
        if (!subscription.lastMealTime) {
          console.log(`[3h Scheduler] Skipping ${subscription.id.substring(0, 8)} - no lastMealTime`);
          continue;
        }

        // Check quiet hours - skip audible notifications
        if (isInQuietHours(subscription)) {
          console.log(`[3h Scheduler] Skipping ${subscription.id.substring(0, 8)} - in quiet hours (${subscription.quietHoursStart}:00-${subscription.quietHoursEnd}:00)`);
          continue;
        }

        const timeSinceLastMeal = now - subscription.lastMealTime;
        const hoursAgoRaw = Math.floor(timeSinceLastMeal / (60 * 60 * 1000));
        const hoursAgo = Math.min(hoursAgoRaw, 99);
        console.log(`[3h Scheduler] ${subscription.id.substring(0, 8)} - last meal ${hoursAgo}h ago`);
        
        if (timeSinceLastMeal < THREE_HOURS_MS) {
          console.log(`[3h Scheduler] Skipping ${subscription.id.substring(0, 8)} - only ${hoursAgo}h (need 3+)`);
          continue;
        }

        const lastSent = lastNotificationSent.get(subscription.id);
        if (lastSent && (now - lastSent) < THREE_HOURS_MS) {
          const hoursSinceLastSent = Math.floor((now - lastSent) / (60 * 60 * 1000));
          console.log(`[3h Scheduler] Skipping ${subscription.id.substring(0, 8)} - already sent ${hoursSinceLastSent}h ago`);
          continue;
        }

        console.log(`[3h Scheduler] Sending push to ${subscription.id.substring(0, 8)} - meal was ${hoursAgo}h ago`);
        const success = await sendPushNotification(subscription, {
          title: "Mealtracker Erinnerung",
          body: `Letzte Mahlzeit war vor ${hoursAgoRaw} Stunden`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          badgeCount: hoursAgo,
        });

        if (success) {
          console.log(`[3h Scheduler] ✅ Push sent successfully to ${subscription.id.substring(0, 8)}`);
          lastNotificationSent.set(subscription.id, now);
        } else {
          console.log(`[3h Scheduler] ❌ Push failed for ${subscription.id.substring(0, 8)}`);
        }
      }
    } catch (error) {
      console.error("Error in 3-hour reminder scheduler:", error);
    }
  });

  cron.schedule("0 9 * * *", async () => {
    try {
      const subscriptions = await storage.getAllPushSubscriptions();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log(`[Daily Reminder] Checking ${subscriptions.length} subscriptions at ${new Date().toISOString()}`);

      for (const subscription of subscriptions) {
        // Check quiet hours - skip audible notifications
        if (isInQuietHours(subscription)) {
          console.log(`[Daily Reminder] Skipping ${subscription.id.substring(0, 8)} - in quiet hours (${subscription.quietHoursStart}:00-${subscription.quietHoursEnd}:00)`);
          continue;
        }

        const lastReminder = subscription.lastDailyReminder 
          ? new Date(subscription.lastDailyReminder) 
          : null;

        if (lastReminder) {
          const lastReminderDay = new Date(lastReminder);
          lastReminderDay.setHours(0, 0, 0, 0);
          
          if (lastReminderDay >= today) {
            console.log(`[Daily Reminder] Skipping ${subscription.id.substring(0, 8)} - already sent today`);
            continue;
          }
        }

        console.log(`[Daily Reminder] Sending to ${subscription.id.substring(0, 8)}`);
        const success = await sendPushNotification(subscription, {
          title: "Mealtracker",
          body: "Hast du heute schon Meals getrackt?",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        });

        if (success) {
          console.log(`[Daily Reminder] ✅ Sent successfully to ${subscription.id.substring(0, 8)}`);
          await storage.updatePushSubscription(subscription.id, {
            lastDailyReminder: new Date(),
          });
        } else {
          console.log(`[Daily Reminder] ❌ Failed for ${subscription.id.substring(0, 8)}`);
        }
      }
    } catch (error) {
      console.error("Error in daily reminder scheduler:", error);
    }
  });

  console.log("✅ Notification schedulers started:");
  console.log("  - Hourly badge update: Every hour (silent push)");
  console.log("  - 3-hour reminder: Every 5 minutes");
  console.log("  - Daily reminder: Every day at 9:00 AM");
}
