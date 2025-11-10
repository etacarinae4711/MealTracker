import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Utensils, Pencil, History, Bell, BellOff, Settings, Plus, Minus } from "lucide-react";
import { registerPushNotifications, unregisterPushNotifications, isPushNotificationEnabled, updateMealTime, resetBadge } from "@/lib/push-notifications";
import { useToast } from "@/hooks/use-toast";

interface MealEntry {
  timestamp: number;
  id: string;
}

export default function Home() {
  const [lastMealTime, setLastMealTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [mealHistory, setMealHistory] = useState<MealEntry[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [targetHours, setTargetHours] = useState<number>(3);
  const [tempTargetHours, setTempTargetHours] = useState<string>("3");
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("lastMealTime");
    if (stored) {
      setLastMealTime(parseInt(stored, 10));
    }

    const storedHistory = localStorage.getItem("mealHistory");
    if (storedHistory) {
      setMealHistory(JSON.parse(storedHistory));
    }

    const storedTargetHours = localStorage.getItem("targetHours");
    if (storedTargetHours) {
      const hours = parseInt(storedTargetHours, 10);
      if (!isNaN(hours) && hours >= 1 && hours <= 24) {
        setTargetHours(hours);
        setTempTargetHours(hours.toString());
      } else {
        localStorage.setItem("targetHours", "3");
        setTargetHours(3);
        setTempTargetHours("3");
      }
    }

    isPushNotificationEnabled().then(setNotificationsEnabled);
  }, []);

  useEffect(() => {
    if (lastMealTime === null) return;

    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = now - lastMealTime;
      setElapsedTime(elapsed);
    };

    updateElapsed();

    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [lastMealTime]);

  // Badge lokal aktualisieren basierend auf verstrichenen Stunden
  useEffect(() => {
    if (lastMealTime === null || !('setAppBadge' in navigator)) return;

    let lastHourCount = -1;

    const updateBadge = async () => {
      const now = Date.now();
      const elapsed = now - lastMealTime;
      const hoursAgo = Math.min(Math.floor(elapsed / (60 * 60 * 1000)), 99);
      
      // Nur aktualisieren wenn sich die Stundenzahl geändert hat
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

    // Sofort aktualisieren
    updateBadge();

    // Jede Minute überprüfen (um Stundenwechsel zu erfassen)
    const interval = setInterval(updateBadge, 60 * 1000);

    return () => clearInterval(interval);
  }, [lastMealTime]);

  const handleTrackMeal = async () => {
    const now = Date.now();
    const newEntry: MealEntry = {
      timestamp: now,
      id: crypto.randomUUID(),
    };

    const updatedHistory = [newEntry, ...mealHistory];
    setLastMealTime(now);
    setMealHistory(updatedHistory);
    localStorage.setItem("lastMealTime", now.toString());
    localStorage.setItem("mealHistory", JSON.stringify(updatedHistory));
    setElapsedTime(0);

    // Badge auf 0 zurücksetzen (lokal)
    if ('setAppBadge' in navigator) {
      try {
        await navigator.setAppBadge(0);
      } catch (error) {
        console.log('Failed to clear badge:', error);
      }
    }

    // Badge-Update an Server senden und Push Notification mit Badge 0 triggern
    if (notificationsEnabled) {
      await updateMealTime(now);
      await resetBadge();
    }
  };

  const handleEditMeal = () => {
    if (lastMealTime) {
      const date = new Date(lastMealTime);
      const dateStr = date.toISOString().split("T")[0];
      const timeStr = date.toTimeString().split(" ")[0].substring(0, 5);
      setEditDate(dateStr);
      setEditTime(timeStr);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (editDate && editTime) {
      const dateTimeStr = `${editDate}T${editTime}:00`;
      const newTime = new Date(dateTimeStr).getTime();
      setLastMealTime(newTime);
      localStorage.setItem("lastMealTime", newTime.toString());

      if (mealHistory.length > 0) {
        const updatedHistory = [...mealHistory];
        updatedHistory[0] = { ...updatedHistory[0], timestamp: newTime };
        setMealHistory(updatedHistory);
        localStorage.setItem("mealHistory", JSON.stringify(updatedHistory));
      }

      // Badge neu berechnen basierend auf bearbeiteter Zeit
      if ('setAppBadge' in navigator) {
        try {
          const hoursAgo = Math.floor((Date.now() - newTime) / (60 * 60 * 1000));
          await navigator.setAppBadge(hoursAgo);
        } catch (error) {
          console.log('Failed to update badge:', error);
        }
      }

      if (notificationsEnabled) {
        await updateMealTime(newTime);
      }

      setIsEditDialogOpen(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      await unregisterPushNotifications();
      setNotificationsEnabled(false);
      toast({
        title: "Benachrichtigungen deaktiviert",
        description: "Sie erhalten keine Erinnerungen mehr",
      });
    } else {
      const success = await registerPushNotifications(lastMealTime || undefined);
      if (success) {
        setNotificationsEnabled(true);
        toast({
          title: "Benachrichtigungen aktiviert",
          description: `Sie erhalten jetzt Erinnerungen nach ${targetHours}+ Stunden und tägliche Reminders`,
        });
      } else {
        toast({
          title: "Fehler",
          description: "Benachrichtigungen konnten nicht aktiviert werden",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveSettings = () => {
    const hours = parseInt(tempTargetHours, 10);
    
    if (isNaN(hours) || hours < 1 || hours > 24) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte geben Sie eine Zahl zwischen 1 und 24 ein",
        variant: "destructive",
      });
      return;
    }

    setTargetHours(hours);
    localStorage.setItem("targetHours", hours.toString());
    setIsSettingsDialogOpen(false);
    
    toast({
      title: "Einstellungen gespeichert",
      description: `Zielzeit auf ${hours} Stunden gesetzt`,
    });
  };

  const handleIncreaseHours = () => {
    const current = parseInt(tempTargetHours, 10);
    if (!isNaN(current) && current < 24) {
      setTempTargetHours((current + 1).toString());
    }
  };

  const handleDecreaseHours = () => {
    const current = parseInt(tempTargetHours, 10);
    if (!isNaN(current) && current > 1) {
      setTempTargetHours((current - 1).toString());
    }
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} um ${timeStr}`;
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const safeTargetHours = Math.max(1, Math.min(24, targetHours));
  const targetMilliseconds = safeTargetHours * 60 * 60 * 1000;
  const isGreen = elapsedTime >= targetMilliseconds;
  
  const progressPercentage = Math.min((elapsedTime / targetMilliseconds) * 100, 100);
  
  const progressHours = Math.floor(elapsedTime / (60 * 60 * 1000));
  const progressMinutes = Math.floor((elapsedTime % (60 * 60 * 1000)) / (60 * 1000));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Mealtracker
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Verfolgen Sie die Zeit seit Ihrer letzten Mahlzeit
          </p>
        </div>

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

          <Button
            onClick={handleToggleNotifications}
            variant={notificationsEnabled ? "default" : "outline"}
            size="sm"
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
        </div>

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
                {formatTime(elapsedTime)}
              </p>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-white/90 font-medium">
                  <span>{progressHours}h {progressMinutes}m</span>
                  <span>{targetHours}h Ziel</span>
                </div>
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
                <p className="text-xs text-white/80 font-medium">
                  {progressPercentage >= 100 ? "Ziel erreicht! 🎉" : `${Math.floor(progressPercentage)}% bis zum ${targetHours}-Stunden-Ziel`}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditMeal}
                    data-testid="button-edit-meal"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Letzte Mahlzeit bearbeiten
                  </Button>
                </DialogTrigger>
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

              <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-history"
                  >
                    <History className="mr-2 h-4 w-4" />
                    Historie anzeigen
                  </Button>
                </DialogTrigger>
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

              <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-settings"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Einstellungen
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-settings" className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Einstellungen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Zielzeit festlegen</Label>
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleDecreaseHours}
                          disabled={parseInt(tempTargetHours, 10) <= 1}
                          className="h-12 w-12 rounded-full"
                          data-testid="button-decrease-hours"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-6xl font-bold text-primary tabular-nums" data-testid="display-target-hours">
                            {String(parseInt(tempTargetHours, 10) || 3).padStart(2, '0')}
                          </div>
                          <div className="text-sm text-muted-foreground font-medium">
                            Stunden
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleIncreaseHours}
                          disabled={parseInt(tempTargetHours, 10) >= 24}
                          className="h-12 w-12 rounded-full"
                          data-testid="button-increase-hours"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Wählen Sie zwischen 1 und 24 Stunden
                      </p>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsSettingsDialogOpen(false)}
                        data-testid="button-cancel-settings"
                      >
                        Abbrechen
                      </Button>
                      <Button
                        onClick={handleSaveSettings}
                        data-testid="button-save-settings"
                      >
                        Speichern
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

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
