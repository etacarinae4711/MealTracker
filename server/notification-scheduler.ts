import cron from "node-cron";
import { storage } from "./storage";
import { sendPushNotification } from "./push-service";

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

const lastNotificationSent = new Map<string, number>();

/**
 * Check if current time is within quiet hours
 * @param quietStart - Start hour (0-23)
 * @param quietEnd - End hour (0-23)
 * @returns true if current time is in quiet hours
 */
function isInQuietHours(quietStart: number, quietEnd: number): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Handle case where quiet hours span midnight (e.g., 22:00 to 08:00)
  if (quietStart > quietEnd) {
    return currentHour >= quietStart || currentHour < quietEnd;
  }
  
  // Normal case (e.g., 01:00 to 06:00)
  return currentHour >= quietStart && currentHour < quietEnd;
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

  // Hourly meal reminder (with Badge)
  cron.schedule("0 * * * *", async () => {
    try {
      const subscriptions = await storage.getAllPushSubscriptions();
      const now = Date.now();
      console.log(`[Hourly Reminder] Checking ${subscriptions.length} subscriptions at ${new Date().toISOString()}`);

      for (const subscription of subscriptions) {
        if (!subscription.lastMealTime) {
          console.log(`[Hourly Reminder] Skipping ${subscription.id.substring(0, 8)} - no lastMealTime`);
          continue;
        }

        // Check quiet hours
        const quietStart = subscription.quietHoursStart ?? 22;
        const quietEnd = subscription.quietHoursEnd ?? 8;
        if (isInQuietHours(quietStart, quietEnd)) {
          console.log(`[Hourly Reminder] Skipping ${subscription.id.substring(0, 8)} - in quiet hours (${quietStart}:00-${quietEnd}:00)`);
          continue;
        }

        const timeSinceLastMeal = now - subscription.lastMealTime;
        const hoursAgoRaw = Math.floor(timeSinceLastMeal / (60 * 60 * 1000));
        const hoursAgo = Math.min(hoursAgoRaw, 99);
        console.log(`[Hourly Reminder] ${subscription.id.substring(0, 8)} - last meal ${hoursAgo}h ago`);
        
        if (timeSinceLastMeal < THREE_HOURS_MS) {
          console.log(`[Hourly Reminder] Skipping ${subscription.id.substring(0, 8)} - only ${hoursAgo}h (need 3+)`);
          continue;
        }

        // Only send reminder once per hour
        const lastSent = lastNotificationSent.get(subscription.id);
        if (lastSent && (now - lastSent) < ONE_HOUR_MS) {
          const minutesSinceLastSent = Math.floor((now - lastSent) / (60 * 1000));
          console.log(`[Hourly Reminder] Skipping ${subscription.id.substring(0, 8)} - already sent ${minutesSinceLastSent}min ago`);
          continue;
        }

        console.log(`[Hourly Reminder] Sending push to ${subscription.id.substring(0, 8)} - meal was ${hoursAgo}h ago`);
        const success = await sendPushNotification(subscription, {
          title: "Mealtracker Reminder",
          body: `Last meal was ${hoursAgoRaw} hours ago`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          badgeCount: hoursAgo,
        });

        if (success) {
          console.log(`[Hourly Reminder] ✅ Push sent successfully to ${subscription.id.substring(0, 8)}`);
          lastNotificationSent.set(subscription.id, now);
        } else {
          console.log(`[Hourly Reminder] ❌ Push failed for ${subscription.id.substring(0, 8)}`);
        }
      }
    } catch (error) {
      console.error("Error in hourly reminder scheduler:", error);
    }
  });

  console.log("✅ Notification schedulers started:");
  console.log("  - Hourly badge update: Every hour (silent push)");
  console.log("  - Hourly meal reminder: Every hour (respects quiet hours)");
}
