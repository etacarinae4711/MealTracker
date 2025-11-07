import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

export default function Home() {
  const [lastMealTime, setLastMealTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem("lastMealTime");
    if (stored) {
      setLastMealTime(parseInt(stored, 10));
    }
  }, []);

  useEffect(() => {
    if (lastMealTime === null) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastMealTime;
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastMealTime]);

  const handleTrackMeal = () => {
    const now = Date.now();
    setLastMealTime(now);
    localStorage.setItem("lastMealTime", now.toString());
    setElapsedTime(0);
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
