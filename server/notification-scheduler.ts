import cron from "node-cron";
import { storage } from "./storage";
import { sendPushNotification } from "./push-service";

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

const lastNotificationSent = new Map<string, number>();

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

      for (const subscription of subscriptions) {
        const lastReminder = subscription.lastDailyReminder 
          ? new Date(subscription.lastDailyReminder) 
          : null;

        if (lastReminder) {
          const lastReminderDay = new Date(lastReminder);
          lastReminderDay.setHours(0, 0, 0, 0);
          
          if (lastReminderDay >= today) {
            continue;
          }
        }

        const success = await sendPushNotification(subscription, {
          title: "Mealtracker",
          body: "Hast du heute schon Meals getrackt?",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        });

        if (success) {
          await storage.updatePushSubscription(subscription.id, {
            lastDailyReminder: new Date(),
          });
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
