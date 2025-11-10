/**
 * Settings Page Component - Mealtracker
 * 
 * Centralized settings page providing configuration for:
 * - Push notification management (enable/disable)
 * - Target hours configuration (1-24 hour range)
 * - Last meal editing (date and time adjustment)
 * - Complete meal history viewing
 * 
 * The page uses a card-based layout for clear organization
 * of different settings categories.
 * 
 * @module pages/settings
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Plus, Minus, ArrowLeft, Clock, History, Pencil, Globe } from "lucide-react";
import {
  registerPushNotifications,
  unregisterPushNotifications,
  isPushNotificationEnabled,
  updateMealTime,
} from "@/lib/push-notifications";
import { useToast } from "@/hooks/use-toast";
import { useMealTracker } from "@/hooks/use-meal-tracker";
import { useLanguage } from "@/hooks/use-language";
import { formatDateTime } from "@/lib/time-utils";
import { TARGET_HOURS_CONFIG, QUIET_HOURS_CONFIG, STORAGE_KEYS } from "@/lib/constants";
import { supportsBadgeAPI } from "@/types/meal-tracker";
import { Language } from "@/lib/translations";

/**
 * Settings page component
 * 
 * Provides a comprehensive settings interface organized into cards:
 * 1. Notifications - Toggle push notifications
 * 2. Target Hours - Configure meal interval goal
 * 3. Edit Last Meal - Adjust timestamp of most recent meal
 * 4. History - View all tracked meals
 */
export default function Settings() {
  // Meal tracking state from custom hook
  const {
    lastMealTime,
    mealHistory,
    targetHours,
    updateLastMealTime,
    updateTargetHours,
  } = useMealTracker();
  
  // Language state and translations
  const { language, t, setLanguage } = useLanguage();
  
  // Local UI state for settings inputs
  const [tempTargetHours, setTempTargetHours] = useState<string>(targetHours.toString());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Quiet hours state
  const [quietHoursStart, setQuietHoursStart] = useState<number>(QUIET_HOURS_CONFIG.DEFAULT_START);
  const [quietHoursEnd, setQuietHoursEnd] = useState<number>(QUIET_HOURS_CONFIG.DEFAULT_END);
  
  // Dialog state
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Edit form state
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  
  const { toast } = useToast();

  /**
   * Effect: Initialize notification state and quiet hours
   * 
   * Checks if push notifications are currently enabled
   * and loads saved quiet hours from localStorage.
   */
  useEffect(() => {
    isPushNotificationEnabled().then(setNotificationsEnabled);
    
    // Load quiet hours from localStorage
    const savedStart = localStorage.getItem(STORAGE_KEYS.QUIET_HOURS_START);
    const savedEnd = localStorage.getItem(STORAGE_KEYS.QUIET_HOURS_END);
    
    if (savedStart !== null) {
      const start = parseInt(savedStart, 10);
      if (!isNaN(start) && start >= QUIET_HOURS_CONFIG.MIN_HOUR && start <= QUIET_HOURS_CONFIG.MAX_HOUR) {
        setQuietHoursStart(start);
      }
    }
    
    if (savedEnd !== null) {
      const end = parseInt(savedEnd, 10);
      if (!isNaN(end) && end >= QUIET_HOURS_CONFIG.MIN_HOUR && end <= QUIET_HOURS_CONFIG.MAX_HOUR) {
        setQuietHoursEnd(end);
      }
    }
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
        description: t.notificationsDescription,
      });
    } else {
      // Enable notifications
      const success = await registerPushNotifications(lastMealTime || undefined);
      if (success) {
        setNotificationsEnabled(true);
        toast({
          title: t.notificationsEnabled,
          description: t.notificationsDescription,
        });
      } else {
        toast({
          title: t.permissionDenied,
          description: t.permissionDenied,
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
        title: t.invalidInput,
        description: `${TARGET_HOURS_CONFIG.MIN}-${TARGET_HOURS_CONFIG.MAX} ${t.hours}`,
        variant: "destructive",
      });
      return;
    }

    // Save via hook (persists to localStorage)
    updateTargetHours(hours);
    
    toast({
      title: t.targetHoursSaved,
      description: `${hours} ${t.hours}`,
    });
  };

  /**
   * Saves the quiet hours settings
   * 
   * Validates the input hours and persists them to localStorage.
   * Also updates the server if push notifications are enabled.
   * 
   * Side effects:
   * - Updates localStorage
   * - May trigger server API call to update push subscription
   * - Shows toast notification
   */
  const handleSaveQuietHours = async () => {
    // Validate hours
    if (quietHoursStart < QUIET_HOURS_CONFIG.MIN_HOUR || quietHoursStart > QUIET_HOURS_CONFIG.MAX_HOUR) {
      toast({
        title: t.invalidInput,
        description: `${QUIET_HOURS_CONFIG.MIN_HOUR}-${QUIET_HOURS_CONFIG.MAX_HOUR}`,
        variant: "destructive",
      });
      return;
    }
    
    if (quietHoursEnd < QUIET_HOURS_CONFIG.MIN_HOUR || quietHoursEnd > QUIET_HOURS_CONFIG.MAX_HOUR) {
      toast({
        title: t.invalidInput,
        description: `${QUIET_HOURS_CONFIG.MIN_HOUR}-${QUIET_HOURS_CONFIG.MAX_HOUR}`,
        variant: "destructive",
      });
      return;
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.QUIET_HOURS_START, quietHoursStart.toString());
    localStorage.setItem(STORAGE_KEYS.QUIET_HOURS_END, quietHoursEnd.toString());
    
    // Update server if notifications are enabled
    if (notificationsEnabled) {
      try {
        // Get current push subscription to extract endpoint
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          const response = await fetch('/api/push/update-quiet-hours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
              quietHoursStart,
              quietHoursEnd,
            }),
          });
          
          if (!response.ok) {
            console.error('Failed to update quiet hours on server');
          }
        }
      } catch (error) {
        console.error('Error updating quiet hours:', error);
      }
    }
    
    toast({
      title: t.quietHoursSaved,
      description: `${String(quietHoursStart).padStart(2, '0')}:00 - ${String(quietHoursEnd).padStart(2, '0')}:00`,
    });
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
        description: t.noMealYet,
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
      if (notificationsEnabled) {
        await updateMealTime(newTime);
      }

      setIsEditDialogOpen(false);
      toast({
        title: t.mealTimeUpdated,
        description: t.mealTimeUpdated,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t.settings}</h1>
            <p className="text-sm text-muted-foreground">{t.languageDescription}</p>
          </div>
        </div>

        {/* Language Selection Card */}
        <Card data-testid="card-language">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t.language}
            </CardTitle>
            <CardDescription>
              {t.languageDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(['en', 'de', 'es'] as const).map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? "default" : "outline"}
                  onClick={() => setLanguage(lang)}
                  className="w-full"
                  data-testid={`button-language-${lang}`}
                >
                  {t.languageNames[lang]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours Card */}
        <Card data-testid="card-quiet-hours">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t.quietHours}
            </CardTitle>
            <CardDescription>
              {t.quietHoursDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">{t.quietHoursStart}</Label>
                <select
                  id="quiet-start"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(parseInt(e.target.value, 10))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  data-testid="select-quiet-start"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quiet-end">{t.quietHoursEnd}</Label>
                <select
                  id="quiet-end"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(parseInt(e.target.value, 10))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  data-testid="select-quiet-end"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              {String(quietHoursStart).padStart(2, '0')}:00 - {String(quietHoursEnd).padStart(2, '0')}:00
            </p>
            
            <Button
              onClick={handleSaveQuietHours}
              className="w-full"
              data-testid="button-save-quiet-hours"
            >
              {t.save}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card data-testid="card-notifications">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t.notifications}
            </CardTitle>
            <CardDescription>
              {t.notificationsDescription}
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
                  {t.enableNotifications}
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
                {t.notificationsDescription}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Target Hours Card */}
        <Card data-testid="card-target-hours">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t.targetHours}
            </CardTitle>
            <CardDescription>
              {t.targetHoursDescription}
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
                className="h-12 w-12 rounded-full"
                data-testid="button-decrease-hours"
              >
                <Minus className="h-5 w-5" />
              </Button>
              
              {/* Large 2-digit display */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-6xl font-bold text-primary tabular-nums" data-testid="display-target-hours">
                  {String(parseInt(tempTargetHours, 10) || TARGET_HOURS_CONFIG.DEFAULT).padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {t.hours}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncreaseHours}
                disabled={parseInt(tempTargetHours, 10) >= TARGET_HOURS_CONFIG.MAX}
                className="h-12 w-12 rounded-full"
                data-testid="button-increase-hours"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              {TARGET_HOURS_CONFIG.MIN}-{TARGET_HOURS_CONFIG.MAX} {t.hours}
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

        {/* Edit Last Meal Card - only shown when meal exists */}
        {lastMealTime && (
          <Card data-testid="card-edit-meal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                {t.editLastMeal}
              </CardTitle>
              <CardDescription>
                {t.editLastMealDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">{t.lastMeal}: </span>
                  <span className="font-medium">{formatDateTime(lastMealTime)}</span>
                </div>
                <Button
                  onClick={handleEditMeal}
                  variant="outline"
                  className="w-full"
                  data-testid="button-edit-meal"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {t.edit}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Card */}
        <Card data-testid="card-history">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t.mealHistory}
            </CardTitle>
            <CardDescription>
              {t.mealHistoryDescription}
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
              {t.viewHistory} ({mealHistory.length})
            </Button>
          </CardContent>
        </Card>

        {/* Edit Meal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent data-testid="dialog-edit-meal">
            <DialogHeader>
              <DialogTitle>{t.editLastMeal}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">{t.edit}</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  data-testid="input-edit-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">{t.edit}</Label>
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

        {/* History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent data-testid="dialog-history" className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t.historyTitle}</DialogTitle>
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
                            {t.lastMeal} {mealHistory.length - index}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(meal.timestamp)}
                          </p>
                        </div>
                        {index === 0 && (
                          <Badge variant="default" data-testid="badge-current">
                            {t.currentMeal}
                          </Badge>
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
