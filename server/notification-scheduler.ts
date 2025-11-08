import cron from "node-cron";
import { storage } from "./storage";
import { sendPushNotification } from "./push-service";

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

const lastNotificationSent = new Map<string, number>();

export function startNotificationScheduler() {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const subscriptions = await storage.getAllPushSubscriptions();
      const now = Date.now();

      for (const subscription of subscriptions) {
        if (!subscription.lastMealTime) {
          continue;
        }

        const timeSinceLastMeal = now - subscription.lastMealTime;
        
        if (timeSinceLastMeal < THREE_HOURS_MS) {
          continue;
        }

        const lastSent = lastNotificationSent.get(subscription.id);
        if (lastSent && (now - lastSent) < THREE_HOURS_MS) {
          continue;
        }

        const hoursAgo = Math.floor(timeSinceLastMeal / (60 * 60 * 1000));
        const success = await sendPushNotification(subscription, {
          title: "Mealtracker Erinnerung",
          body: `Letzte Mahlzeit war vor ${hoursAgo} Stunden`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        });

        if (success) {
          lastNotificationSent.set(subscription.id, now);
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
  console.log("  - 3-hour reminder: Every 5 minutes");
  console.log("  - Daily reminder: Every day at 9:00 AM");
}
