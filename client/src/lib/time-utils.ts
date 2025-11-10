/**
 * Time formatting and calculation utilities for the Mealtracker application
 * 
 * This module provides reusable functions for time-related operations
 * including formatting, elapsed time calculations, and progress tracking.
 */

import { TIME } from "./constants";

/**
 * Formats a duration in milliseconds to HH:MM:SS format
 * 
 * @param milliseconds - Duration in milliseconds to format
 * @returns Formatted time string (e.g., "02:30:45")
 * 
 * @example
 * formatElapsedTime(90000) // Returns "00:01:30"
 * formatElapsedTime(3665000) // Returns "01:01:05"
 */
export function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / TIME.SECOND_MS);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Formats a timestamp to localized German date and time
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date and time string in German locale
 * 
 * @example
 * formatDateTime(1699612800000) // Returns "10.11.2023 um 14:00"
 */
export function formatDateTime(timestamp: number): string {
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
}

/**
 * Calculates the elapsed time between a past timestamp and now
 * 
 * @param startTime - Unix timestamp in milliseconds
 * @returns Elapsed time in milliseconds
 * 
 * @example
 * calculateElapsedTime(Date.now() - 3600000) // Returns ~3600000 (1 hour)
 */
export function calculateElapsedTime(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * Calculates hours and minutes from milliseconds
 * 
 * @param milliseconds - Duration in milliseconds
 * @returns Object containing hours and minutes as integers
 * 
 * @example
 * getHoursAndMinutes(5400000) // Returns { hours: 1, minutes: 30 }
 */
export function getHoursAndMinutes(milliseconds: number): { hours: number; minutes: number } {
  const hours = Math.floor(milliseconds / TIME.HOUR_MS);
  const minutes = Math.floor((milliseconds % TIME.HOUR_MS) / TIME.MINUTE_MS);
  
  return { hours, minutes };
}

/**
 * Calculates progress percentage towards a target duration
 * 
 * @param elapsed - Elapsed time in milliseconds
 * @param targetHours - Target duration in hours
 * @returns Progress percentage (capped at 100)
 * 
 * @example
 * calculateProgress(1800000, 2) // Returns 25 (30 minutes of 2 hours)
 */
export function calculateProgress(elapsed: number, targetHours: number): number {
  const targetMilliseconds = targetHours * TIME.HOUR_MS;
  const percentage = (elapsed / targetMilliseconds) * 100;
  
  return Math.min(percentage, 100);
}

/**
 * Converts elapsed time to hours (rounded down)
 * 
 * Used for badge display to show whole hours since last meal.
 * 
 * @param milliseconds - Elapsed time in milliseconds
 * @param maxDisplay - Maximum value to return (for badge overflow protection)
 * @returns Hours elapsed (capped at maxDisplay)
 * 
 * @example
 * millisecondsToHours(7200000, 99) // Returns 2
 * millisecondsToHours(360000000, 99) // Returns 99 (100 hours capped)
 */
export function millisecondsToHours(milliseconds: number, maxDisplay: number = 99): number {
  const hours = Math.floor(milliseconds / TIME.HOUR_MS);
  return Math.min(hours, maxDisplay);
}
