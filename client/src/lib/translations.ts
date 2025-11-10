/**
 * Multi-language translation system for Mealtracker
 * 
 * Provides translations for English (default), German, and Spanish.
 * All UI text should be defined here to enable easy localization.
 */

export type Language = 'en' | 'de' | 'es';

export interface Translations {
  // Common
  back: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  
  // Home Page
  trackMeal: string;
  lastMeal: string;
  noMealYet: string;
  targetGoal: string;
  
  // Settings Page
  settings: string;
  notifications: string;
  notificationsDescription: string;
  enableNotifications: string;
  targetHours: string;
  targetHoursDescription: string;
  hours: string;
  editLastMeal: string;
  editLastMealDescription: string;
  mealHistory: string;
  mealHistoryDescription: string;
  viewHistory: string;
  currentMeal: string;
  language: string;
  languageDescription: string;
  quietHours: string;
  quietHoursDescription: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursSaved: string;
  
  // Notifications
  permissionDenied: string;
  notificationsEnabled: string;
  notificationsDisabled: string;
  
  // Toast Messages
  targetHoursSaved: string;
  mealTimeUpdated: string;
  mealDeleted: string;
  invalidInput: string;
  
  // History Dialog
  historyTitle: string;
  noHistory: string;
  
  // Language Names
  languageNames: {
    en: string;
    de: string;
    es: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    
    // Home Page
    trackMeal: 'Track Meal',
    lastMeal: 'Last Meal',
    noMealYet: 'No meal tracked yet',
    targetGoal: 'minimum',
    
    // Settings Page
    settings: 'Settings',
    notifications: 'Notifications',
    notificationsDescription: 'Receive reminders when you reach the minimum time between meals',
    enableNotifications: 'Enable Notifications',
    targetHours: 'Minimum Time Between Meals',
    targetHoursDescription: 'Set the minimum interval between meals (1-24 hours)',
    hours: 'hours',
    editLastMeal: 'Edit Last Meal',
    editLastMealDescription: 'Manually adjust your last meal time',
    mealHistory: 'Meal History',
    mealHistoryDescription: 'View all your tracked meals',
    viewHistory: 'View History',
    currentMeal: 'Current',
    language: 'Language',
    languageDescription: 'Choose your preferred language',
    quietHours: 'Quiet Hours',
    quietHoursDescription: 'Set hours when no notifications should be sent',
    quietHoursStart: 'Start',
    quietHoursEnd: 'End',
    quietHoursSaved: 'Quiet hours saved',
    
    // Notifications
    permissionDenied: 'Notification permission denied',
    notificationsEnabled: 'Notifications enabled',
    notificationsDisabled: 'Notifications disabled',
    
    // Toast Messages
    targetHoursSaved: 'Minimum interval saved',
    mealTimeUpdated: 'Meal time updated',
    mealDeleted: 'Meal deleted',
    invalidInput: 'Invalid input',
    
    // History Dialog
    historyTitle: 'Meal History',
    noHistory: 'No meals tracked yet',
    
    // Language Names
    languageNames: {
      en: 'English',
      de: 'Deutsch',
      es: 'Español',
    },
  },
  
  de: {
    // Common
    back: 'Zurück',
    save: 'Speichern',
    cancel: 'Abbrechen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    
    // Home Page
    trackMeal: 'Mahlzeit erfassen',
    lastMeal: 'Letzte Mahlzeit',
    noMealYet: 'Noch keine Mahlzeit erfasst',
    targetGoal: 'Mindestabstand',
    
    // Settings Page
    settings: 'Einstellungen',
    notifications: 'Benachrichtigungen',
    notificationsDescription: 'Erhalte Erinnerungen bei Erreichen des Mindestabstands zwischen Mahlzeiten',
    enableNotifications: 'Benachrichtigungen aktivieren',
    targetHours: 'Mindestabstand zwischen Mahlzeiten',
    targetHoursDescription: 'Lege den Mindestabstand zwischen Mahlzeiten fest (1-24 Stunden)',
    hours: 'Stunden',
    editLastMeal: 'Letzte Mahlzeit bearbeiten',
    editLastMealDescription: 'Passe deine letzte Mahlzeit manuell an',
    mealHistory: 'Mahlzeiten-Historie',
    mealHistoryDescription: 'Alle erfassten Mahlzeiten anzeigen',
    viewHistory: 'Historie anzeigen',
    currentMeal: 'Aktuell',
    language: 'Sprache',
    languageDescription: 'Wähle deine bevorzugte Sprache',
    quietHours: 'Ruhezeiten',
    quietHoursDescription: 'Lege fest, wann keine Benachrichtigungen gesendet werden sollen',
    quietHoursStart: 'Beginn',
    quietHoursEnd: 'Ende',
    quietHoursSaved: 'Ruhezeiten gespeichert',
    
    // Notifications
    permissionDenied: 'Benachrichtigungsberechtigung verweigert',
    notificationsEnabled: 'Benachrichtigungen aktiviert',
    notificationsDisabled: 'Benachrichtigungen deaktiviert',
    
    // Toast Messages
    targetHoursSaved: 'Mindestabstand gespeichert',
    mealTimeUpdated: 'Mahlzeit aktualisiert',
    mealDeleted: 'Mahlzeit gelöscht',
    invalidInput: 'Ungültige Eingabe',
    
    // History Dialog
    historyTitle: 'Mahlzeiten-Historie',
    noHistory: 'Noch keine Mahlzeiten erfasst',
    
    // Language Names
    languageNames: {
      en: 'English',
      de: 'Deutsch',
      es: 'Español',
    },
  },
  
  es: {
    // Common
    back: 'Atrás',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    
    // Home Page
    trackMeal: 'Registrar Comida',
    lastMeal: 'Última Comida',
    noMealYet: 'Aún no se ha registrado ninguna comida',
    targetGoal: 'mínimo',
    
    // Settings Page
    settings: 'Configuración',
    notifications: 'Notificaciones',
    notificationsDescription: 'Recibe recordatorios al alcanzar el intervalo mínimo entre comidas',
    enableNotifications: 'Activar Notificaciones',
    targetHours: 'Intervalo mínimo entre comidas',
    targetHoursDescription: 'Establece el intervalo mínimo entre comidas (1-24 horas)',
    hours: 'horas',
    editLastMeal: 'Editar Última Comida',
    editLastMealDescription: 'Ajusta manualmente la hora de tu última comida',
    mealHistory: 'Historial de Comidas',
    mealHistoryDescription: 'Ver todas tus comidas registradas',
    viewHistory: 'Ver Historial',
    currentMeal: 'Actual',
    language: 'Idioma',
    languageDescription: 'Elige tu idioma preferido',
    quietHours: 'Horas silenciosas',
    quietHoursDescription: 'Establece las horas en las que no se deben enviar notificaciones',
    quietHoursStart: 'Inicio',
    quietHoursEnd: 'Fin',
    quietHoursSaved: 'Horas silenciosas guardadas',
    
    // Notifications
    permissionDenied: 'Permiso de notificación denegado',
    notificationsEnabled: 'Notificaciones activadas',
    notificationsDisabled: 'Notificaciones desactivadas',
    
    // Toast Messages
    targetHoursSaved: 'Intervalo mínimo guardado',
    mealTimeUpdated: 'Hora de comida actualizada',
    mealDeleted: 'Comida eliminada',
    invalidInput: 'Entrada inválida',
    
    // History Dialog
    historyTitle: 'Historial de Comidas',
    noHistory: 'Aún no hay comidas registradas',
    
    // Language Names
    languageNames: {
      en: 'English',
      de: 'Deutsch',
      es: 'Español',
    },
  },
};

/**
 * Get translations for a specific language
 * 
 * @param language - The language code (en, de, es)
 * @returns Translation object for the specified language
 * 
 * @example
 * const t = getTranslations('de');
 * console.log(t.trackMeal); // "Mahlzeit erfassen"
 */
export function getTranslations(language: Language): Translations {
  return translations[language];
}

/**
 * Check if a language code is valid
 * 
 * @param lang - Language code to validate
 * @returns True if language is supported
 */
export function isValidLanguage(lang: string): lang is Language {
  return lang === 'en' || lang === 'de' || lang === 'es';
}
