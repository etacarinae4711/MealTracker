import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, Plus, Minus, ArrowLeft, Clock, History, Pencil } from "lucide-react";
import { registerPushNotifications, unregisterPushNotifications, isPushNotificationEnabled, updateMealTime } from "@/lib/push-notifications";
import { useToast } from "@/hooks/use-toast";

interface MealEntry {
  timestamp: number;
  id: string;
}

export default function Settings() {
  const [lastMealTime, setLastMealTime] = useState<number | null>(null);
  const [mealHistory, setMealHistory] = useState<MealEntry[]>([]);
  const [targetHours, setTargetHours] = useState<number>(3);
  const [tempTargetHours, setTempTargetHours] = useState<string>("3");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
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

  const handleSaveTargetHours = () => {
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
    
    toast({
      title: "Einstellungen gespeichert",
      description: `Zielzeit auf ${hours} Stunden gesetzt`,
    });
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
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
            <Button
              onClick={handleSaveTargetHours}
              className="w-full"
              data-testid="button-save-target-hours"
            >
              Speichern
            </Button>
          </CardContent>
        </Card>

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
