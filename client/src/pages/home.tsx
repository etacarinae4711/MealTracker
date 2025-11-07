import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, Pencil } from "lucide-react";

export default function Home() {
  const [lastMealTime, setLastMealTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("lastMealTime");
    if (stored) {
      setLastMealTime(parseInt(stored, 10));
    }
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

  const handleTrackMeal = () => {
    const now = Date.now();
    setLastMealTime(now);
    localStorage.setItem("lastMealTime", now.toString());
    setElapsedTime(0);
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

  const handleSaveEdit = () => {
    if (editDate && editTime) {
      const dateTimeStr = `${editDate}T${editTime}:00`;
      const newTime = new Date(dateTimeStr).getTime();
      setLastMealTime(newTime);
      localStorage.setItem("lastMealTime", newTime.toString());
      setIsEditDialogOpen(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const isGreen = elapsedTime >= 3 * 60 * 60 * 1000;

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

        <div className="flex justify-center">
          <Button
            onClick={handleTrackMeal}
            size="lg"
            className="min-h-14 px-8 text-lg font-semibold"
            data-testid="button-track-meal"
          >
            <Utensils className="mr-2 h-5 w-5" />
            Track Meal
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
            </div>

            <div className="flex justify-center">
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
