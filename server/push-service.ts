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
}

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
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

export function getVapidPublicKey(): string {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VAPID_PUBLIC_KEY not configured");
  }
  return VAPID_PUBLIC_KEY;
}
