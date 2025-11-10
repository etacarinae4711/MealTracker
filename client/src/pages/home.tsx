/**
 * Home Page Component - Mealtracker
 * 
 * The main page of the application that provides:
 * - A prominent "Track Meal" button to record new meals
 * - Real-time timer display showing elapsed time since last meal
 * - Visual progress indicator (red when under target, green when reached)
 * - Progress bar showing percentage towards target goal
 * - Quick access to settings via icon button
 * 
 * The component automatically updates every second to show elapsed time
 * and manages the PWA app badge to display hours since last meal.
 * 
 * @module pages/home
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Utensils, Settings as SettingsIcon } from "lucide-react";
import {
  isPushNotificationEnabled,
  updateMealTime,
  resetBadge,
} from "@/lib/push-notifications";
import { useMealTracker } from "@/hooks/use-meal-tracker";
import { useLanguage } from "@/hooks/use-language";
import {
  formatElapsedTime,
  calculateElapsedTime,
  getHoursAndMinutes,
  calculateProgress,
  millisecondsToHours,
} from "@/lib/time-utils";
import { BADGE_CONFIG, TIMER_CONFIG, TIME, TARGET_HOURS_CONFIG } from "@/lib/constants";
import { supportsBadgeAPI } from "@/types/meal-tracker";

/**
 * Home page component
 * 
 * Displays the meal tracking interface with real-time updates.
 * Coordinates between UI state, localStorage persistence (via hook),
 * and PWA features (badges, push notifications).
 */
export default function Home() {
  // Meal tracking state managed by custom hook
  const { lastMealTime, trackMeal, targetHours } = useMealTracker();
  
  // Language support
  const { t } = useLanguage();
  
  // Local UI state for elapsed time (updated every second)
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  /**
   * Effect: Update elapsed time display
   * 
   * Sets up an interval that updates the elapsed time every second.
   * This creates the real-time timer effect in the UI.
   * 
   * Dependencies:
   * - lastMealTime: When this changes, restart the timer from zero
   */
  useEffect(() => {
    if (lastMealTime === null) return;

    const updateElapsed = () => {
      const elapsed = calculateElapsedTime(lastMealTime);
      setElapsedTime(elapsed);
    };

    // Update immediately
    updateElapsed();

    // Then update every second
    const interval = setInterval(updateElapsed, TIMER_CONFIG.UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [lastMealTime]);

  /**
   * Effect: Update PWA app badge
   * 
   * Manages the app badge to show hours since last meal.
   * Updates every minute to check for hour changes.
   * 
   * Badge behavior:
   * - Shows 0-99 hours
   * - Only updates when the hour count changes (reduces API calls)
   * - Automatically clears when no meal is tracked
   * 
   * Dependencies:
   * - lastMealTime: When this changes, recalculate badge
   */
  useEffect(() => {
    if (lastMealTime === null || !supportsBadgeAPI(navigator)) return;

    let lastHourCount = -1;

    const updateBadge = async () => {
      const elapsed = calculateElapsedTime(lastMealTime);
      const hoursAgo = millisecondsToHours(elapsed, BADGE_CONFIG.MAX_DISPLAY);
      
      // Only update if hours changed (prevents unnecessary API calls)
      if (hoursAgo !== lastHourCount) {
        try {
          await navigator.setAppBadge(hoursAgo);
          console.log(`Badge updated locally to ${hoursAgo} hours`);
          lastHourCount = hoursAgo;
        } catch (error) {
          console.log('Failed to update badge locally:', error);
        }
      }
    };

    // Update immediately
    updateBadge();

    // Check every minute for hour changes
    const interval = setInterval(updateBadge, BADGE_CONFIG.UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [lastMealTime]);

  /**
   * Handles tracking a new meal
   * 
   * Actions performed:
   * 1. Creates new meal entry via hook (persists to localStorage)
   * 2. Resets elapsed time to zero
   * 3. Clears app badge (sets to 0)
   * 4. If push notifications enabled, syncs with server
   * 
   * Side effects:
   * - Updates localStorage (via useMealTracker hook)
   * - Updates app badge
   * - May trigger server API call for push notification sync
   */
  const handleTrackMeal = async () => {
    // Create new meal entry (hook handles persistence)
    trackMeal();
    
    // Reset UI state
    setElapsedTime(0);

    // Clear app badge (local)
    if (supportsBadgeAPI(navigator)) {
      try {
        await navigator.setAppBadge(0);
      } catch (error) {
        console.log('Failed to clear badge:', error);
      }
    }

    // Sync with server if push notifications are enabled
    const isEnabled = await isPushNotificationEnabled();
    if (isEnabled) {
      await updateMealTime(Date.now());
      await resetBadge();
    }
  };

  // Calculate progress and visual state
  // Clamp target hours to valid range for safety
  const safeTargetHours = Math.max(
    TARGET_HOURS_CONFIG.MIN,
    Math.min(TARGET_HOURS_CONFIG.MAX, targetHours)
  );
  
  const targetMilliseconds = safeTargetHours * TIME.HOUR_MS;
  const isGreen = elapsedTime >= targetMilliseconds;
  
  const progressPercentage = calculateProgress(elapsedTime, safeTargetHours);
  const { hours: progressHours, minutes: progressMinutes } = getHoursAndMinutes(elapsedTime);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8 relative">
      {/* Settings button - positioned absolutely in top-right */}
      <Link href="/settings" className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" data-testid="button-settings">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </Link>

      <div className="w-full max-w-md space-y-8">
        {/* Header section */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Mealtracker
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Verfolgen Sie die Zeit seit Ihrer letzten Mahlzeit
          </p>
        </div>

        {/* Track Meal button - primary action */}
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={handleTrackMeal}
            size="lg"
            className="w-full min-h-16 px-8 text-lg font-bold rounded-3xl bg-gradient-to-b from-teal-500 to-teal-700 text-white border-2 border-teal-800 shadow-[0_8px_0_0_rgb(17,94,89),0_13px_25px_0_rgba(0,0,0,0.3)] hover:shadow-[0_6px_0_0_rgb(17,94,89),0_10px_20px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] active:shadow-[0_2px_0_0_rgb(17,94,89),0_3px_10px_0_rgba(0,0,0,0.3)] active:translate-y-[6px] transition-all duration-100"
            data-testid="button-track-meal"
          >
            <Utensils className="mr-3 h-6 w-6" />
            Track Meal
          </Button>
        </div>

        {/* Timer display - shows when meal has been tracked */}
        {lastMealTime !== null && (
          <div className="space-y-4">
            <div
              className={`rounded-2xl p-8 md:p-12 text-center transition-all duration-300 border ${
                isGreen
                  ? "bg-green-500 border-green-600"
                  : "bg-red-500 border-red-600"
              }`}
              data-testid="timer-display"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-white mb-4">
                Zeit seit letzter Mahlzeit
              </p>
              <p className="text-5xl md:text-6xl font-bold text-white" data-testid="timer-value">
                {formatElapsedTime(elapsedTime)}
              </p>
              
              {/* Progress information */}
              <div className="mt-6 space-y-2">
                {/* Progress labels */}
                <div className="flex justify-between text-xs text-white/90 font-medium">
                  <span>{progressHours}h {progressMinutes}m</span>
                  <span>{targetHours}h Ziel</span>
                </div>
                
                {/* Progress bar */}
                <div 
                  className="relative h-3 w-full overflow-hidden rounded-full bg-white/20"
                  role="progressbar"
                  aria-valuenow={Math.floor(progressPercentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Fortschritt bis zum ${targetHours}-Stunden-Ziel`}
                >
                  <div 
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                    data-testid="progress-bar"
                  />
                </div>
                
                {/* Progress text */}
                <p className="text-xs text-white/80 font-medium">
                  {progressPercentage >= 100 
                    ? "Ziel erreicht!" 
                    : `${Math.floor(progressPercentage)}% bis zum ${targetHours}-Stunden-Ziel`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder display - shows when no meal tracked */}
        {lastMealTime === null && (
          <div className="rounded-2xl p-8 md:p-12 text-center bg-muted border border-border">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Zeit seit letzter Mahlzeit
            </p>
            <p className="text-5xl md:text-6xl font-bold text-muted-foreground">
              --:--:--
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Klicken Sie auf "Track Meal" um zu beginnen
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
