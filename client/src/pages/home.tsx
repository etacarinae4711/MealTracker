import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Utensils, Settings as SettingsIcon } from "lucide-react";
import { isPushNotificationEnabled, updateMealTime, resetBadge } from "@/lib/push-notifications";

interface MealEntry {
  timestamp: number;
  id: string;
}

export default function Home() {
  const [lastMealTime, setLastMealTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [mealHistory, setMealHistory] = useState<MealEntry[]>([]);
  const [targetHours, setTargetHours] = useState<number>(3);

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
      } else {
        localStorage.setItem("targetHours", "3");
        setTargetHours(3);
      }
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

    // Badge-Update an Server senden (wenn Notifications aktiviert sind)
    const isEnabled = await isPushNotificationEnabled();
    if (isEnabled) {
      await updateMealTime(now);
      await resetBadge();
    }
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8 relative">
      <Link href="/settings" className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" data-testid="button-settings">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </Link>

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
