/**
 * TypeScript type definitions for the Mealtracker application
 * 
 * This module centralizes all type definitions to ensure type safety
 * and consistency across the application.
 */

/**
 * Represents a single meal entry in the user's history
 * 
 * Each entry records when a meal was tracked and has a unique identifier
 * for reliable list rendering and potential future features.
 */
export interface MealEntry {
  /** Unix timestamp in milliseconds when the meal was tracked */
  timestamp: number;
  
  /** Unique identifier for this meal entry (UUID v4) */
  id: string;
}

/**
 * User's meal tracking state
 * 
 * Represents all the data needed to track meals and display progress
 */
export interface MealTrackerState {
  /** Timestamp of the most recent meal, or null if no meal tracked yet */
  lastMealTime: number | null;
  
  /** Complete history of all tracked meals, newest first */
  mealHistory: MealEntry[];
  
  /** User's target interval in hours (1-24) */
  targetHours: number;
}

/**
 * Type guard to check if the browser supports the Badge API
 * 
 * This allows TypeScript to understand that setAppBadge exists
 * when the check passes.
 * 
 * @param nav - The navigator object to check
 * @returns True if Badge API is supported
 */
export function supportsBadgeAPI(
  nav: Navigator
): nav is Navigator & { setAppBadge: (count?: number) => Promise<void> } {
  return "setAppBadge" in nav;
}
