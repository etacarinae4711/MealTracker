/**
 * Application-wide constants for the Mealtracker application
 * 
 * This module centralizes all magic numbers and configuration values
 * to improve maintainability and prevent inconsistencies.
 */

/**
 * LocalStorage keys used throughout the application
 * 
 * These keys are used to persist user data in the browser's localStorage.
 * Changing these values will cause existing data to be orphaned.
 */
export const STORAGE_KEYS = {
  /** Timestamp (in milliseconds) of the user's last tracked meal */
  LAST_MEAL_TIME: "lastMealTime",
  
  /** Array of meal entries with timestamps and IDs */
  MEAL_HISTORY: "mealHistory",
  
  /** User's target hours (1-24) for meal interval goals */
  TARGET_HOURS: "targetHours",
  
  /** Quiet hours start (0-23, hour of day when quiet hours begin) */
  QUIET_HOURS_START: "quietHoursStart",
  
  /** Quiet hours end (0-23, hour of day when quiet hours end) */
  QUIET_HOURS_END: "quietHoursEnd",
} as const;

/**
 * Time conversion constants
 * 
 * Pre-calculated millisecond values for common time units
 * to avoid repeated calculations and improve readability.
 */
export const TIME = {
  /** Milliseconds in one second (1000ms) */
  SECOND_MS: 1000,
  
  /** Milliseconds in one minute (60,000ms) */
  MINUTE_MS: 60 * 1000,
  
  /** Milliseconds in one hour (3,600,000ms) */
  HOUR_MS: 60 * 60 * 1000,
} as const;

/**
 * Target hours configuration
 * 
 * Defines the valid range for the user's target meal interval.
 * These values are enforced in validation and UI controls.
 */
export const TARGET_HOURS_CONFIG = {
  /** Minimum allowed target hours */
  MIN: 1,
  
  /** Maximum allowed target hours */
  MAX: 24,
  
  /** Default target hours when no preference is set */
  DEFAULT: 3,
} as const;

/**
 * Badge configuration
 * 
 * Settings for the PWA app badge that displays hours since last meal
 */
export const BADGE_CONFIG = {
  /** Maximum badge count to display (prevents overflow) */
  MAX_DISPLAY: 99,
  
  /** Update interval in milliseconds (checks every minute for hour changes) */
  UPDATE_INTERVAL_MS: TIME.MINUTE_MS,
} as const;

/**
 * Timer update configuration
 * 
 * Controls how frequently the elapsed time display is updated
 */
export const TIMER_CONFIG = {
  /** Update interval in milliseconds (updates every second) */
  UPDATE_INTERVAL_MS: TIME.SECOND_MS,
} as const;

/**
 * Quiet hours configuration
 * 
 * Defines default quiet hours settings to prevent notifications during sleep/rest time
 */
export const QUIET_HOURS_CONFIG = {
  /** Default start hour (22:00 / 10 PM) */
  DEFAULT_START: 22,
  
  /** Default end hour (8:00 / 8 AM) */
  DEFAULT_END: 8,
  
  /** Minimum hour value */
  MIN_HOUR: 0,
  
  /** Maximum hour value */
  MAX_HOUR: 23,
} as const;
