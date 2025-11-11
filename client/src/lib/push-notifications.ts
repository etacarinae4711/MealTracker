/**
 * Push Notification Management for Mealtracker PWA
 * 
 * This module handles all interactions with the Push API and Service Worker
 * for managing push notifications and server-side subscriptions.
 * 
 * Features:
 * - Service worker registration and subscription
 * - VAPID key exchange with server
 * - Push subscription management (subscribe/unsubscribe)
 * - Meal time synchronization with server
 * - Badge reset coordination
 * 
 * @module lib/push-notifications
 */

/**
 * Registers push notifications for the user
 * 
 * This is the main entry point for enabling push notifications.
 * It performs the following steps:
 * 1. Checks browser support for Service Workers and Push API
 * 2. Requests notification permission from user
 * 3. Waits for service worker to be ready
 * 4. Retrieves VAPID public key from server
 * 5. Creates push subscription with browser
 * 6. Sends subscription to server for storage
 * 
 * @param lastMealTime - Optional timestamp of last meal (for immediate sync)
 * @param quietHoursStart - Optional quiet hours start (0-23)
 * @param quietHoursEnd - Optional quiet hours end (0-23)
 * @returns Promise resolving to true if successful, false otherwise
 * 
 * @example
 * const success = await registerPushNotifications(Date.now(), 22, 8);
 * if (success) {
 *   console.log("Push notifications enabled");
 * }
 */
export async function registerPushNotifications(
  lastMealTime?: number,
  quietHoursStart?: number,
  quietHoursEnd?: number
): Promise<boolean> {
  // Check browser support
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push notifications not supported");
    return false;
  }

  try {
    // Request permission from user
    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return false;
    }

    // Wait for service worker to be active
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from server
    const response = await fetch("/api/push/vapid-public-key");
    const { publicKey } = await response.json();

    // Create push subscription with browser's Push Manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Send subscription details to server for storage
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
          auth: arrayBufferToBase64(subscription.getKey("auth")),
        },
        lastMealTime: lastMealTime ?? null,
        quietHoursStart: quietHoursStart ?? null,
        quietHoursEnd: quietHoursEnd ?? null,
      }),
    });

    return true;
  } catch (error) {
    console.error("Error registering push notifications:", error);
    return false;
  }
}

/**
 * Updates the last meal time on the server
 * 
 * Synchronizes the meal timestamp with the server so that
 * scheduled notifications can be sent at the correct time.
 * 
 * Called when:
 * - User tracks a new meal
 * - User edits the last meal time
 * 
 * @param lastMealTime - Unix timestamp in milliseconds
 * 
 * @example
 * await updateMealTime(Date.now());
 */
export async function updateMealTime(lastMealTime: number): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await fetch("/api/push/update-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          lastMealTime,
        }),
      });
    }
  } catch (error) {
    console.error("Error updating meal time:", error);
  }
}

/**
 * Updates quiet hours settings on the server
 * 
 * Synchronizes quiet hours configuration with the server so that
 * scheduled notifications respect the user's preference.
 * 
 * Called when:
 * - User changes quiet hours in settings
 * 
 * @param quietHoursStart - Start hour (0-23)
 * @param quietHoursEnd - End hour (0-23)
 * 
 * @example
 * await updateQuietHours(22, 8);
 */
export async function updateQuietHours(quietHoursStart: number, quietHoursEnd: number): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await fetch("/api/push/update-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          quietHoursStart,
          quietHoursEnd,
        }),
      });
    }
  } catch (error) {
    console.error("Error updating quiet hours:", error);
  }
}

/**
 * Resets the app badge to zero via server push
 * 
 * Sends a silent push notification to the service worker
 * which resets the badge count to 0. This ensures the badge
 * is cleared even if the app is closed.
 * 
 * Note: The badge is also reset locally when tracking a meal,
 * but this server-side reset ensures consistency.
 * 
 * @example
 * await resetBadge(); // Badge cleared via push notification
 */
export async function resetBadge(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await fetch("/api/push/reset-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
    }
  } catch (error) {
    console.error("Error resetting badge:", error);
  }
}

/**
 * Unregisters push notifications
 * 
 * Performs cleanup when user disables notifications:
 * 1. Removes subscription from server database
 * 2. Unsubscribes from browser Push Manager
 * 
 * The service worker remains registered for potential re-subscription.
 * 
 * @example
 * await unregisterPushNotifications();
 * console.log("Notifications disabled");
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Remove from server database
      await fetch("/api/push/unsubscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      // Unsubscribe from browser
      await subscription.unsubscribe();
    }
  } catch (error) {
    console.error("Error unregistering push notifications:", error);
  }
}

/**
 * Checks if push notifications are currently enabled
 * 
 * Returns true if:
 * - Browser supports Service Workers and Push API
 * - Service worker is registered
 * - Active push subscription exists
 * 
 * @returns Promise resolving to true if notifications enabled
 * 
 * @example
 * const enabled = await isPushNotificationEnabled();
 * if (enabled) {
 *   console.log("Notifications are active");
 * }
 */
export async function isPushNotificationEnabled(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Converts URL-safe base64 string to Uint8Array
 * 
 * VAPID public keys are transmitted as URL-safe base64 strings
 * but must be converted to Uint8Array for the Push API.
 * 
 * Steps:
 * 1. Add padding if needed (base64 requires length divisible by 4)
 * 2. Convert URL-safe characters (- and _) to standard base64 (+ and /)
 * 3. Decode base64 to binary string
 * 4. Convert binary string to Uint8Array
 * 
 * @param base64String - URL-safe base64 encoded string
 * @returns Uint8Array suitable for Push API
 * 
 * @internal
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Converts ArrayBuffer to base64 string
 * 
 * Push subscription keys (p256dh and auth) are ArrayBuffers
 * but need to be transmitted as base64 strings to the server.
 * 
 * @param buffer - ArrayBuffer to convert (or null)
 * @returns Base64 encoded string, or empty string if buffer is null
 * 
 * @internal
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
