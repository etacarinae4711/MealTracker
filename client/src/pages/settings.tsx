/**
 * Settings Page Component - Mealtracker
 * 
 * Centralized settings page providing configuration for:
 * - Push notification management (enable/disable)
 * - Target hours configuration (1-24 hour range)
 * - Quiet hours configuration (notification-free time periods)
 * - Language selection (EN/DE/ES)
 * - Complete meal history viewing
 * 
 * The page uses a card-based layout for clear organization
 * of different settings categories.
 * 
 * Note: Last meal editing is now on the home page, not here.
 * 
 * @module pages/settings
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BellOff, Plus, Minus, ArrowLeft, Clock, History, Languages } from "lucide-react";
import {
  registerPushNotifications,
  unregisterPushNotifications,
  isPushNotificationEnabled,
  updateQuietHours as syncQuietHours,
  updateLanguage as syncLanguage,
} from "@/lib/push-notifications";
import { useToast } from "@/hooks/use-toast";
import { useMealTracker } from "@/hooks/use-meal-tracker";
import { useLanguage } from "@/hooks/use-language";
import { formatDateTime } from "@/lib/time-utils";
import { TARGET_HOURS_CONFIG } from "@/lib/constants";
import type { Language } from "@/lib/translations";

/**
 * Settings page component
 * 
 * Provides a comprehensive settings interface organized into cards:
 * 1. Notifications - Toggle push notifications
 * 2. Target Hours - Configure meal interval goal
 * 3. Language - Select UI language (EN/DE/ES)
 * 4. Quiet Hours - Configure notification-free time periods
 * 5. History - View all tracked meals
 */
export default function Settings() {
  // Meal tracking state from custom hook
  const {
    lastMealTime,
    mealHistory,
    targetHours,
    quietHoursStart,
    quietHoursEnd,
    updateLastMealTime,
    updateTargetHours,
    updateQuietHours,
  } = useMealTracker();
  
  // Language support
  const { language, setLanguage, t } = useLanguage();
  
  // Local UI state for settings inputs
  const [tempTargetHours, setTempTargetHours] = useState<string>(targetHours.toString());
  const [tempQuietStart, setTempQuietStart] = useState<string>(quietHoursStart.toString());
  const [tempQuietEnd, setTempQuietEnd] = useState<string>(quietHoursEnd.toString());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Dialog state
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  const { toast } = useToast();

  /**
   * Effect: Initialize notification state
   * 
   * Checks if push notifications are currently enabled
   * and updates the UI state accordingly.
   */
  useEffect(() => {
    isPushNotificationEnabled().then(setNotificationsEnabled);
  }, []);

  /**
   * Effect: Sync tempTargetHours with actual targetHours
   * 
   * Ensures the input field displays the current saved value
   * when the component mounts or targetHours changes externally.
   */
  useEffect(() => {
    setTempTargetHours(targetHours.toString());
  }, [targetHours]);

  /**
   * Effect: Sync language preference with push notification server
   * 
   * When user changes language, update the server-side subscription
   * so that future push notifications are sent in the correct language.
   * 
   * Note: This runs on every language change, including initial mount.
   * The server endpoint is idempotent and handles this gracefully.
   */
  useEffect(() => {
    syncLanguage(language).catch((error) => {
      console.error("Failed to sync language with server:", error);
    });
  }, [language]);

  /**
   * Toggles push notifications on/off
   * 
   * Actions:
   * - If enabled: Unregisters service worker and disables notifications
   * - If disabled: Registers service worker and enables notifications
   * 
   * Side effects:
   * - Registers/unregisters service worker
   * - Updates server-side push subscription
   * - Shows toast notification with result
   */
  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // Disable notifications
      await unregisterPushNotifications();
      setNotificationsEnabled(false);
      toast({
        title: t.notificationsDisabled,
        description: t.notificationsDisabledDescription,
      });
    } else {
      // Enable notifications with current quiet hours settings and language
      const success = await registerPushNotifications(
        lastMealTime || undefined,
        quietHoursStart,
        quietHoursEnd,
        language
      );
      if (success) {
        setNotificationsEnabled(true);
        toast({
          title: t.notificationsEnabled,
          description: t.notificationsEnabledDescription.replace('{hours}', targetHours.toString()),
        });
      } else {
        toast({
          title: t.error,
          description: t.notificationsError,
          variant: "destructive",
        });
      }
    }
  };

  /**
   * Increases target hours by 1 (with validation)
   * 
   * Maximum value is TARGET_HOURS_CONFIG.MAX (24 hours)
   */
  const handleIncreaseHours = () => {
    const current = parseInt(tempTargetHours, 10);
    if (!isNaN(current) && current < TARGET_HOURS_CONFIG.MAX) {
      setTempTargetHours((current + 1).toString());
    }
  };

  /**
   * Decreases target hours by 1 (with validation)
   * 
   * Minimum value is TARGET_HOURS_CONFIG.MIN (1 hour)
   */
  const handleDecreaseHours = () => {
    const current = parseInt(tempTargetHours, 10);
    if (!isNaN(current) && current > TARGET_HOURS_CONFIG.MIN) {
      setTempTargetHours((current - 1).toString());
    }
  };

  /**
   * Saves the target hours setting
   * 
   * Validates the input is within allowed range (1-24)
   * and persists the value via the useMealTracker hook.
   * 
   * Side effects:
   * - Updates localStorage (via hook)
   * - Shows toast notification
   */
  const handleSaveTargetHours = () => {
    const hours = parseInt(tempTargetHours, 10);
    
    // Validate input
    if (isNaN(hours) || hours < TARGET_HOURS_CONFIG.MIN || hours > TARGET_HOURS_CONFIG.MAX) {
      toast({
        title: t.error,
        description: t.minimumMealIntervalValidation
          .replace('{min}', TARGET_HOURS_CONFIG.MIN.toString())
          .replace('{max}', TARGET_HOURS_CONFIG.MAX.toString()),
        variant: "destructive",
      });
      return;
    }

    // Save via hook (persists to localStorage)
    updateTargetHours(hours);
    
    toast({
      title: t.saved,
      description: `${t.minimumMealInterval}: ${hours} ${t.hours}`,
    });
  };

  const handleSaveQuietHours = async () => {
    // Parse and validate inputs
    const start = parseInt(tempQuietStart, 10);
    const end = parseInt(tempQuietEnd, 10);
    
    // Check for NaN or out of range
    if (isNaN(start) || isNaN(end) || start < 0 || start > 23 || end < 0 || end > 23) {
      // Reset inputs to saved values on validation failure
      setTempQuietStart(quietHoursStart.toString());
      setTempQuietEnd(quietHoursEnd.toString());
      toast({
        title: t.error,
        description: t.quietHoursValidation,
        variant: "destructive",
      });
      return;
    }

    // Check if start equals end (invalid - must have a time range)
    if (start === end) {
      // Reset inputs to saved values on validation failure
      setTempQuietStart(quietHoursStart.toString());
      setTempQuietEnd(quietHoursEnd.toString());
      toast({
        title: t.error,
        description: t.quietHoursValidation,
        variant: "destructive",
      });
      return;
    }

    // Update local state first (localStorage is source of truth)
    updateQuietHours(start, end);
    
    try {
      // Try to sync with server (will be no-op if notifications disabled)
      // This ensures backend has latest values when notifications are enabled
      await syncQuietHours(start, end);
    } catch (error) {
      // Log sync error but don't prevent local update
      // User can still configure quiet hours for when they re-enable notifications
      console.warn("Failed to sync quiet hours with server:", error);
    }
    
    // Always show success toast after local update
    toast({
      title: t.saved,
      description: `${t.quietHours}: ${start}:00 - ${end}:00`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t.settingsTitle}</h1>
            <p className="text-sm text-muted-foreground">{t.settingsDescription}</p>
          </div>
        </div>

        {/* Notifications Card */}
        <Card data-testid="card-notifications">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t.pushNotifications}
            </CardTitle>
            <CardDescription>
              {t.pushNotificationsDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleToggleNotifications}
              variant={notificationsEnabled ? "default" : "outline"}
              className="w-full"
              data-testid="button-toggle-notifications"
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  {t.notificationsActive}
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  {t.enableNotifications}
                </>
              )}
            </Button>
            {notificationsEnabled && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {t.notificationsEnabledDetailDesc.replace('{hours}', targetHours.toString())}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Target Hours Card */}
        <Card data-testid="card-target-hours">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t.minimumMealInterval}
            </CardTitle>
            <CardDescription>
              {t.minimumMealIntervalDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Number picker with +/- buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecreaseHours}
                disabled={parseInt(tempTargetHours, 10) <= TARGET_HOURS_CONFIG.MIN}
                className="h-11 w-11 rounded-full"
                data-testid="button-decrease-hours"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              {/* Compact 2-digit display */}
              <div className="flex flex-col items-center gap-1">
                <div className="text-4xl font-bold text-primary tabular-nums" data-testid="display-target-hours">
                  {String(parseInt(tempTargetHours, 10) || TARGET_HOURS_CONFIG.DEFAULT).padStart(2, '0')}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {t.hours}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncreaseHours}
                disabled={parseInt(tempTargetHours, 10) >= TARGET_HOURS_CONFIG.MAX}
                className="h-11 w-11 rounded-full"
                data-testid="button-increase-hours"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              {t.minimumMealIntervalRange
                .replace('{min}', TARGET_HOURS_CONFIG.MIN.toString())
                .replace('{max}', TARGET_HOURS_CONFIG.MAX.toString())}
            </p>
            
            <Button
              onClick={handleSaveTargetHours}
              className="w-full"
              data-testid="button-save-target-hours"
            >
              {t.save}
            </Button>
          </CardContent>
        </Card>

        {/* Language Selector Card */}
        <Card data-testid="card-language">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t.language}
            </CardTitle>
            <CardDescription>
              {t.languageDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
              <SelectTrigger data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Quiet Hours Card */}
        <Card data-testid="card-quiet-hours">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t.quietHours}
            </CardTitle>
            <CardDescription>
              {t.quietHoursDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">{t.quietHoursStart}</Label>
                <Select
                  value={tempQuietStart}
                  onValueChange={setTempQuietStart}
                >
                  <SelectTrigger id="quiet-start" data-testid="select-quiet-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {String(i).padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">{t.quietHoursEnd}</Label>
                <Select
                  value={tempQuietEnd}
                  onValueChange={setTempQuietEnd}
                >
                  <SelectTrigger id="quiet-end" data-testid="select-quiet-end">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {String(i).padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleSaveQuietHours}
              className="w-full"
              data-testid="button-save-quiet-hours"
            >
              {t.saveQuietHours}
            </Button>
          </CardContent>
        </Card>

        {/* History Card */}
        <Card data-testid="card-history">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t.mealHistory}
            </CardTitle>
            <CardDescription>
              {t.mealHistoryDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsHistoryDialogOpen(true)}
              variant="outline"
              className="w-full"
              data-testid="button-show-history"
            >
              <History className="mr-2 h-4 w-4" />
              {t.showHistory} ({mealHistory.length})
            </Button>
          </CardContent>
        </Card>

        {/* History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent data-testid="dialog-history" className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t.mealHistory}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              {mealHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t.noHistory}
                </div>
              ) : (
                <div className="space-y-2">
                  {mealHistory.map((meal, index) => (
                    <div
                      key={meal.id}
                      className="p-4 rounded-lg border border-border bg-card"
                      data-testid={`history-item-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            {t.mealNumber} {mealHistory.length - index}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(meal.timestamp)}
                          </p>
                        </div>
                        {index === 0 && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md">
                            {t.current}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
