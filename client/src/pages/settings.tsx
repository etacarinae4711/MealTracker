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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BellOff, Plus, Minus, ArrowLeft, Clock, History, Pencil, Languages } from "lucide-react";
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
import { TARGET_HOURS_CONFIG } from "@/lib/constants";
import { supportsBadgeAPI } from "@/types/meal-tracker";
import type { Language } from "@/lib/translations";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Edit form state
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  
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
      // Enable notifications
      const success = await registerPushNotifications(lastMealTime || undefined);
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

  const handleSaveQuietHours = () => {
    const start = parseInt(tempQuietStart, 10);
    const end = parseInt(tempQuietEnd, 10);
    
    if (isNaN(start) || isNaN(end) || start < 0 || start > 23 || end < 0 || end > 23) {
      toast({
        title: t.error,
        description: t.quietHoursValidation,
        variant: "destructive",
      });
      return;
    }

    updateQuietHours(start, end);
    
    toast({
      title: t.saved,
      description: `${t.quietHours}: ${start}:00 - ${end}:00`,
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
        title: "Keine Mahlzeit",
        description: "Bitte tracken Sie zuerst eine Mahlzeit",
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
        title: "Mahlzeit aktualisiert",
        description: "Die letzte Mahlzeit wurde bearbeitet",
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
            <h1 className="text-3xl font-bold">Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Passen Sie Ihre Präferenzen an</p>
          </div>
        </div>

        {/* Notifications Card */}
        <Card data-testid="card-notifications">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Benachrichtigungen
            </CardTitle>
            <CardDescription>
              Push-Benachrichtigungen für Erinnerungen
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
                  Benachrichtigungen aktiv
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Benachrichtigungen aktivieren
                </>
              )}
            </Button>
            {notificationsEnabled && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Sie erhalten Erinnerungen nach {targetHours}+ Stunden und tägliche Reminders um 9:00 Uhr
              </p>
            )}
          </CardContent>
        </Card>

        {/* Target Hours Card */}
        <Card data-testid="card-target-hours">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Zielzeit festlegen
            </CardTitle>
            <CardDescription>
              Nach wie vielen Stunden möchten Sie erinnert werden?
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
                  Stunden
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
              Wählen Sie zwischen {TARGET_HOURS_CONFIG.MIN} und {TARGET_HOURS_CONFIG.MAX} Stunden
            </p>
            
            <Button
              onClick={handleSaveTargetHours}
              className="w-full"
              data-testid="button-save-target-hours"
            >
              Speichern
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
              Choose your preferred language
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
              {t.quietHoursDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">{t.quietHoursStart}</Label>
                <Input
                  id="quiet-start"
                  type="number"
                  min="0"
                  max="23"
                  value={tempQuietStart}
                  onChange={(e) => setTempQuietStart(e.target.value)}
                  data-testid="input-quiet-start"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">{t.quietHoursEnd}</Label>
                <Input
                  id="quiet-end"
                  type="number"
                  min="0"
                  max="23"
                  value={tempQuietEnd}
                  onChange={(e) => setTempQuietEnd(e.target.value)}
                  data-testid="input-quiet-end"
                />
              </div>
            </div>
            <Button
              onClick={handleSaveQuietHours}
              className="w-full"
              data-testid="button-save-quiet-hours"
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
                Letzte Mahlzeit bearbeiten
              </CardTitle>
              <CardDescription>
                Aktualisieren Sie die Zeit Ihrer letzten Mahlzeit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Letzte Mahlzeit: </span>
                  <span className="font-medium">{formatDateTime(lastMealTime)}</span>
                </div>
                <Button
                  onClick={handleEditMeal}
                  variant="outline"
                  className="w-full"
                  data-testid="button-edit-meal"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Zeit ändern
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
              Mahlzeiten-Historie
            </CardTitle>
            <CardDescription>
              Alle aufgezeichneten Mahlzeiten anzeigen
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
              Historie anzeigen ({mealHistory.length})
            </Button>
          </CardContent>
        </Card>

        {/* Edit Meal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent data-testid="dialog-edit-meal">
            <DialogHeader>
              <DialogTitle>Letzte Mahlzeit bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Datum</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  data-testid="input-edit-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Uhrzeit</Label>
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
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  data-testid="button-save-edit"
                >
                  Speichern
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent data-testid="dialog-history" className="max-w-md">
            <DialogHeader>
              <DialogTitle>Mahlzeiten-Historie</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              {mealHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Noch keine Mahlzeiten aufgezeichnet
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
                            Mahlzeit {mealHistory.length - index}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(meal.timestamp)}
                          </p>
                        </div>
                        {index === 0 && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md">
                            Aktuell
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
