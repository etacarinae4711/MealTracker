/**
 * Home Page Component - Mealtracker
 * 
 * The main page of the application that provides:
 * - A prominent "Track Meal" button to record new meals
 * - Real-time timer display showing elapsed time since last meal
 * - Visual progress indicator (red when under target, green when reached)
 * - Progress bar showing percentage towards target goal
 * - Elegant glassmorphic "Edit Last Meal" card with quick-edit dialog
 * - Quick access to settings via icon button
 * 
 * The component automatically updates every second to show elapsed time
 * and manages the PWA app badge to display hours since last meal.
 * 
 * Edit functionality: Users can modify the last meal timestamp via an
 * inline glassmorphic card that appears below the timer. The edit dialog
 * syncs changes with both localStorage and the notification server.
 * 
 * @module pages/home
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, Settings as SettingsIcon, Pencil } from "lucide-react";
import {
  isPushNotificationEnabled,
  updateMealTime,
  resetBadge,
} from "@/lib/push-notifications";
import { useMealTracker } from "@/hooks/use-meal-tracker";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import {
  formatElapsedTime,
  calculateElapsedTime,
  getHoursAndMinutes,
  calculateProgress,
  millisecondsToHours,
  formatDateTime,
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
  const { lastMealTime, trackMeal, targetHours, updateLastMealTime } = useMealTracker();
  
  // Language support
  const { t } = useLanguage();
  
  // Toast notifications
  const { toast } = useToast();
  
  // Local UI state for elapsed time (updated every second)
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  /**
   * Edit dialog state
   * 
   * Date and time are stored as strings (not Date objects) to maintain
   * compatibility with HTML5 date/time input controls, which expect
   * "YYYY-MM-DD" and "HH:MM" string formats.
   */
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

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

  /**
   * Opens the edit dialog with current meal time
   * 
   * Populates the date and time inputs with the last meal's timestamp.
   * Shows error if no meal has been tracked yet.
   */
  const handleEditMeal = () => {
    if (lastMealTime) {
      const date = new Date(lastMealTime);
      const dateStr = date.toISOString().split("T")[0];
      const timeStr = date.toTimeString().split(" ")[0].substring(0, 5);
      setEditDate(dateStr);
      setEditTime(timeStr);
      setIsEditDialogOpen(true);
    } else {
      toast({
        title: t.noMealYet,
        description: t.noMealYetDesc,
        variant: "destructive",
      });
    }
  };

  /**
   * Saves the edited meal time
   * 
   * Actions performed:
   * 1. Combines date and time inputs into timestamp
   * 2. Updates last meal time via hook (persists to localStorage and history)
   * 3. Updates app badge with new hours count
   * 4. If notifications enabled, syncs with server
   * 
   * Side effects:
   * - Updates localStorage (via hook)
   * - Updates app badge
   * - May trigger server API call
   * - Shows toast notification
   */
  const handleSaveEdit = async () => {
    if (editDate && editTime) {
      // Combine date and time into timestamp
      const dateTimeStr = `${editDate}T${editTime}:00`;
      const newTime = new Date(dateTimeStr).getTime();
      
      // Update via hook (persists to localStorage and history)
      updateLastMealTime(newTime);

      // Update badge with new hours count
      if (supportsBadgeAPI(navigator)) {
        try {
          const hoursAgo = Math.floor((Date.now() - newTime) / (60 * 60 * 1000));
          await navigator.setAppBadge(hoursAgo);
        } catch (error) {
          console.log('Failed to update badge:', error);
        }
      }

      // Sync with server if notifications enabled
      const isEnabled = await isPushNotificationEnabled();
      if (isEnabled) {
        await updateMealTime(newTime);
        await resetBadge();
      }

      setIsEditDialogOpen(false);
      toast({
        title: t.success,
        description: t.editLastMeal,
      });
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
            {t.appSubtitle}
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
            {t.trackMeal}
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
                {t.timeSinceLastMeal}
              </p>
              <p className="text-3xl md:text-4xl font-bold text-white" data-testid="timer-value">
                {formatElapsedTime(elapsedTime)}
              </p>
              
              {/* Progress information */}
              <div className="mt-6 space-y-2">
                {/* Progress labels */}
                <div className="flex justify-between text-xs text-white/90 font-medium">
                  <span>{progressHours}{t.hoursShort} {progressMinutes}{t.minutesShort}</span>
                  <span>{targetHours}{t.hoursShort} {t.target}</span>
                </div>
                
                {/* Progress bar */}
                <div 
                  className="relative h-3 w-full overflow-hidden rounded-full bg-white/20"
                  role="progressbar"
                  aria-valuenow={Math.floor(progressPercentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t.progressLabel.replace('{hours}', targetHours.toString())}
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
                    ? t.goalReached
                    : t.progressToGoal
                        .replace('{percentage}', Math.floor(progressPercentage).toString())
                        .replace('{hours}', targetHours.toString())
                  }
                </p>
              </div>
            </div>

            {/* 
              Edit Last Meal Card - Entry point to edit dialog
              
              Glassmorphic card design with translucent background and backdrop blur.
              Appears only when a meal has been tracked. Clicking "Change Time" button
              opens the edit dialog (handleEditMeal), which allows users to modify the
              last meal timestamp. Changes are saved via handleSaveEdit and synced with
              both localStorage and the notification server for PWA badge updates.
            */}
            <Card 
              className="overflow-visible bg-card/80 backdrop-blur-md border-border/60 rounded-xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
              data-testid="card-edit-last-meal"
            >
              <div className="flex items-center gap-3 p-4">
                {/* Icon with subtle circle background */}
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-muted/50">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {/* Timestamp display */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">
                    {t.lastMeal}
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate" data-testid="text-last-meal">
                    {formatDateTime(lastMealTime)}
                  </p>
                </div>
                
                {/* Edit button */}
                <Button
                  onClick={handleEditMeal}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  data-testid="button-edit-last-meal"
                  aria-describedby="edit-meal-helper"
                >
                  {t.changeTime}
                </Button>
                <span id="edit-meal-helper" className="sr-only">
                  {t.editLastMealDesc}
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Placeholder display - shows when no meal tracked */}
        {lastMealTime === null && (
          <div className="rounded-2xl p-8 md:p-12 text-center bg-muted border border-border">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              {t.timeSinceLastMeal}
            </p>
            <p className="text-3xl md:text-4xl font-bold text-muted-foreground">
              --:--:--
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {t.noMealInstructions}
            </p>
          </div>
        )}
      </div>

      {/* Edit Meal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-meal">
          <DialogHeader>
            <DialogTitle>{t.editLastMeal}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">{t.date}</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                data-testid="input-edit-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">{t.time}</Label>
              <Input
                id="edit-time"
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                data-testid="input-edit-time"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                data-testid="button-cancel-edit"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleSaveEdit}
                data-testid="button-save-edit"
              >
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
