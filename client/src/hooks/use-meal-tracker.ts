/**
 * Custom React hook for managing meal tracking state and persistence
 * 
 * This hook centralizes all meal tracking logic, localStorage persistence,
 * and provides a clean API for components to interact with meal data.
 * 
 * @module use-meal-tracker
 */

import { useState, useEffect } from "react";
import { MealEntry, MealTrackerState } from "@/types/meal-tracker";
import { STORAGE_KEYS, TARGET_HOURS_CONFIG, QUIET_HOURS_CONFIG } from "@/lib/constants";

/**
 * Hook return type with state and actions
 */
interface UseMealTrackerReturn extends MealTrackerState {
  /** Records a new meal at the current time */
  trackMeal: () => MealEntry;
  
  /** Updates the timestamp of the most recent meal */
  updateLastMealTime: (timestamp: number) => void;
  
  /** Updates the user's target hours setting */
  updateTargetHours: (hours: number) => void;
  
  /** Quiet hours start (0-23) */
  quietHoursStart: number;
  
  /** Quiet hours end (0-23) */
  quietHoursEnd: number;
  
  /** Updates quiet hours settings */
  updateQuietHours: (start: number, end: number) => void;
}

/**
 * Loads and validates the target hours from localStorage
 * 
 * Ensures the value is a valid number within the allowed range.
 * Falls back to default if invalid or missing.
 * 
 * @returns Valid target hours value
 */
function loadTargetHours(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.TARGET_HOURS);
  
  if (!stored) {
    return TARGET_HOURS_CONFIG.DEFAULT;
  }
  
  const hours = parseInt(stored, 10);
  
  // Validate range
  if (isNaN(hours) || hours < TARGET_HOURS_CONFIG.MIN || hours > TARGET_HOURS_CONFIG.MAX) {
    // Reset to default if corrupted
    localStorage.setItem(STORAGE_KEYS.TARGET_HOURS, TARGET_HOURS_CONFIG.DEFAULT.toString());
    return TARGET_HOURS_CONFIG.DEFAULT;
  }
  
  return hours;
}

/**
 * Loads meal history from localStorage
 * 
 * Safely parses JSON and returns an empty array if invalid.
 * 
 * @returns Array of meal entries
 */
function loadMealHistory(): MealEntry[] {
  const stored = localStorage.getItem(STORAGE_KEYS.MEAL_HISTORY);
  
  if (!stored) {
    return [];
  }
  
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Invalid JSON, return empty array
    return [];
  }
}

/**
 * Loads quiet hours start from localStorage
 * 
 * @returns Valid hour (0-23)
 */
function loadQuietHoursStart(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.QUIET_HOURS_START);
  
  if (!stored) {
    return QUIET_HOURS_CONFIG.DEFAULT_START;
  }
  
  const hour = parseInt(stored, 10);
  
  if (isNaN(hour) || hour < QUIET_HOURS_CONFIG.MIN_HOUR || hour > QUIET_HOURS_CONFIG.MAX_HOUR) {
    return QUIET_HOURS_CONFIG.DEFAULT_START;
  }
  
  return hour;
}

/**
 * Loads quiet hours end from localStorage
 * 
 * @returns Valid hour (0-23)
 */
function loadQuietHoursEnd(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.QUIET_HOURS_END);
  
  if (!stored) {
    return QUIET_HOURS_CONFIG.DEFAULT_END;
  }
  
  const hour = parseInt(stored, 10);
  
  if (isNaN(hour) || hour < QUIET_HOURS_CONFIG.MIN_HOUR || hour > QUIET_HOURS_CONFIG.MAX_HOUR) {
    return QUIET_HOURS_CONFIG.DEFAULT_END;
  }
  
  return hour;
}

/**
 * Custom hook for meal tracking state management
 * 
 * Provides a centralized interface for:
 * - Loading persisted data from localStorage
 * - Tracking new meals
 * - Updating meal times and settings
 * - Maintaining meal history
 * 
 * @returns State and actions for meal tracking
 * 
 * @example
 * const { lastMealTime, trackMeal, targetHours } = useMealTracker();
 * 
 * // Track a new meal
 * const meal = trackMeal();
 * 
 * // Update settings
 * updateTargetHours(5);
 */
export function useMealTracker(): UseMealTrackerReturn {
  // Initialize state from localStorage
  const [lastMealTime, setLastMealTime] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_MEAL_TIME);
    return stored ? parseInt(stored, 10) : null;
  });
  
  const [mealHistory, setMealHistory] = useState<MealEntry[]>(loadMealHistory);
  const [targetHours, setTargetHours] = useState<number>(loadTargetHours);
  const [quietHoursStart, setQuietHoursStart] = useState<number>(loadQuietHoursStart);
  const [quietHoursEnd, setQuietHoursEnd] = useState<number>(loadQuietHoursEnd);
  
  /**
   * Tracks a new meal at the current timestamp
   * 
   * Creates a new meal entry, updates the history, and persists to localStorage.
   * The new meal becomes the most recent (first) entry in the history.
   * 
   * @returns The newly created meal entry
   */
  const trackMeal = (): MealEntry => {
    const now = Date.now();
    
    const newEntry: MealEntry = {
      timestamp: now,
      id: crypto.randomUUID(),
    };
    
    // Add to front of history (newest first)
    const updatedHistory = [newEntry, ...mealHistory];
    
    // Update state
    setLastMealTime(now);
    setMealHistory(updatedHistory);
    
    // Persist to localStorage
    localStorage.setItem(STORAGE_KEYS.LAST_MEAL_TIME, now.toString());
    localStorage.setItem(STORAGE_KEYS.MEAL_HISTORY, JSON.stringify(updatedHistory));
    
    return newEntry;
  };
  
  /**
   * Updates the last meal time
   * 
   * Used when editing the timestamp of the most recent meal.
   * Also updates the first entry in the history to match.
   * 
   * @param timestamp - New timestamp in milliseconds
   */
  const updateLastMealTime = (timestamp: number): void => {
    setLastMealTime(timestamp);
    localStorage.setItem(STORAGE_KEYS.LAST_MEAL_TIME, timestamp.toString());
    
    // Update the most recent entry in history if it exists
    if (mealHistory.length > 0) {
      const updatedHistory = [...mealHistory];
      updatedHistory[0] = { ...updatedHistory[0], timestamp };
      
      setMealHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEYS.MEAL_HISTORY, JSON.stringify(updatedHistory));
    }
  };
  
  /**
   * Updates the user's target hours setting
   * 
   * Validates the input and persists to localStorage.
   * 
   * @param hours - New target hours (must be 1-24)
   */
  const updateTargetHours = (hours: number): void => {
    // Clamp to valid range
    const validHours = Math.max(
      TARGET_HOURS_CONFIG.MIN,
      Math.min(TARGET_HOURS_CONFIG.MAX, hours)
    );
    
    setTargetHours(validHours);
    localStorage.setItem(STORAGE_KEYS.TARGET_HOURS, validHours.toString());
  };
  
  /**
   * Updates quiet hours settings
   * 
   * Validates inputs and persists to localStorage.
   * 
   * @param start - Start hour (0-23)
   * @param end - End hour (0-23)
   */
  const updateQuietHours = (start: number, end: number): void => {
    // Clamp to valid range
    const validStart = Math.max(
      QUIET_HOURS_CONFIG.MIN_HOUR,
      Math.min(QUIET_HOURS_CONFIG.MAX_HOUR, start)
    );
    const validEnd = Math.max(
      QUIET_HOURS_CONFIG.MIN_HOUR,
      Math.min(QUIET_HOURS_CONFIG.MAX_HOUR, end)
    );
    
    setQuietHoursStart(validStart);
    setQuietHoursEnd(validEnd);
    localStorage.setItem(STORAGE_KEYS.QUIET_HOURS_START, validStart.toString());
    localStorage.setItem(STORAGE_KEYS.QUIET_HOURS_END, validEnd.toString());
  };
  
  return {
    lastMealTime,
    mealHistory,
    targetHours,
    quietHoursStart,
    quietHoursEnd,
    trackMeal,
    updateLastMealTime,
    updateTargetHours,
    updateQuietHours,
  };
}
