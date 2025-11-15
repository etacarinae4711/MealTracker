/**
 * Push Notification Service
 * 
 * Handles sending push notifications to registered devices using Web Push.
 * Uses VAPID keys for authentication with the push service.
 * 
 * Environment requirements:
 *   - VAPID_PUBLIC_KEY: Public key for client subscription
 *   - VAPID_PRIVATE_KEY: Private key for signing notifications (keep secret!)
 * 
 * These keys can be generated with: npx web-push generate-vapid-keys
 * 
 * @module server/push-service
 */

import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn("⚠️  VAPID keys not configured. Push notifications will not work.");
  console.warn("   Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.");
} else {
  webpush.setVapidDetails(
    "mailto:support@mealtracker.app",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  silent?: boolean;
  badgeCount?: number;
}

/**
 * Sends a push notification to a registered device
 * 
 * @param {object} subscription - Push subscription from database
 * @param {string} subscription.endpoint - Push service endpoint URL
 * @param {string} subscription.keys - JSON string containing p256dh and auth keys
 * @param {PushNotificationPayload} payload - Notification content
 * @returns {Promise<boolean>} true if sent successfully, false on error
 * 
 * @example
 * const subscription = await storage.getPushSubscriptionByEndpoint(endpoint);
 * await sendPushNotification(subscription, {
 *   title: 'Meal Reminder',
 *   body: 'It has been 3 hours since your last meal',
 *   badgeCount: 3
 * });
 */

export async function sendPushNotification(
  subscription: { endpoint: string; keys: string },
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const keys = JSON.parse(subscription.keys);
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return true;
  } catch (error: any) {
    // If subscription expired (410 Gone), throw error so caller can clean up
    if (error.statusCode === 410) {
      console.warn(`Push subscription expired (410): ${subscription.endpoint.substring(0, 50)}...`);
      throw error; // Re-throw so scheduler can delete the subscription
    }
    console.error("Error sending push notification:", error);
    return false;
  }
}

/**
 * Returns the public VAPID key for client subscription
 * 
 * @returns {string} The VAPID public key
 * @throws {Error} If VAPID_PUBLIC_KEY environment variable is not set
 */
export function getVapidPublicKey(): string {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VAPID_PUBLIC_KEY not configured");
  }
  return VAPID_PUBLIC_KEY;
}
