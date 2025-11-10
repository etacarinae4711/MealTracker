/**
 * Multi-Language Translations
 * 
 * Supports English (EN), German (DE), and Spanish (ES)
 * All user-facing text is defined here for easy internationalization
 */

export type Language = 'en' | 'de' | 'es';

export interface Translations {
  // Navigation & Settings
  settings: string;
  language: string;
  
  // Home Page
  trackMeal: string;
  timeSinceLastMeal: string;
  noMealTracked: string;
  hours: string;
  minutes: string;
  
  // Settings Page
  pushNotifications: string;
  enableNotifications: string;
  disableNotifications: string;
  notificationsEnabled: string;
  notificationsDisabled: string;
  
  minimumMealInterval: string;
  minimumMealIntervalDesc: string;
  currentInterval: string;
  saveInterval: string;
  
  quietHours: string;
  quietHoursDesc: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  saveQuietHours: string;
  
  editLastMeal: string;
  editLastMealDesc: string;
  selectDate: string;
  selectTime: string;
  saveChanges: string;
  cancel: string;
  
  mealHistory: string;
  mealHistoryDesc: string;
  clearHistory: string;
  clearHistoryConfirm: string;
  noHistory: string;
  ago: string;
  
  // Notifications
  notificationTitle: string;
  notificationBody: string;
  reminderTitle: string;
  reminderBody: string;
  
  // Messages
  saved: string;
  error: string;
  success: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Settings
    settings: 'Settings',
    language: 'Language',
    
    // Home Page
    trackMeal: 'Track Meal',
    timeSinceLastMeal: 'Time since last meal',
    noMealTracked: 'No meal tracked yet',
    hours: 'hours',
    minutes: 'minutes',
    
    // Settings Page
    pushNotifications: 'Push Notifications',
    enableNotifications: 'Enable Notifications',
    disableNotifications: 'Disable Notifications',
    notificationsEnabled: 'Notifications enabled',
    notificationsDisabled: 'Notifications disabled',
    notificationsEnabledDescription: 'You will receive reminders after {hours}+ hours and daily reminders',
    notificationsDisabledDescription: 'You will no longer receive reminders',
    notificationsError: 'Could not enable notifications',
    
    minimumMealInterval: 'Minimum Time Between Meals',
    minimumMealIntervalDesc: 'Set your desired minimum interval between meals',
    minimumMealIntervalValidation: 'Please enter a number between {min} and {max}',
    currentInterval: 'Current interval',
    saveInterval: 'Save Interval',
    
    quietHours: 'Quiet Hours',
    quietHoursDesc: 'No notifications during these hours',
    quietHoursStart: 'Start time',
    quietHoursEnd: 'End time',
    quietHoursValidation: 'Please enter valid hours (0-23)',
    saveQuietHours: 'Save Quiet Hours',
    
    editLastMeal: 'Edit Last Meal',
    editLastMealDesc: 'Adjust the date and time of your last meal',
    selectDate: 'Select date',
    selectTime: 'Select time',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    
    mealHistory: 'Meal History',
    mealHistoryDesc: 'View and manage all your tracked meals',
    clearHistory: 'Clear All History',
    clearHistoryConfirm: 'Are you sure you want to clear all meal history?',
    noHistory: 'No meals tracked yet',
    ago: 'ago',
    
    // Notifications
    notificationTitle: 'Meal Reminder',
    notificationBody: 'It has been {hours} hours since your last meal',
    reminderTitle: 'Time to eat!',
    reminderBody: 'You have reached your {hours}-hour interval',
    
    // Messages
    saved: 'Settings saved',
    error: 'An error occurred',
    success: 'Success',
  },
  
  de: {
    // Navigation & Settings
    settings: 'Einstellungen',
    language: 'Sprache',
    
    // Home Page
    trackMeal: 'Mahlzeit tracken',
    timeSinceLastMeal: 'Zeit seit letzter Mahlzeit',
    noMealTracked: 'Noch keine Mahlzeit erfasst',
    hours: 'Stunden',
    minutes: 'Minuten',
    
    // Settings Page
    pushNotifications: 'Push-Benachrichtigungen',
    enableNotifications: 'Benachrichtigungen aktivieren',
    disableNotifications: 'Benachrichtigungen deaktivieren',
    notificationsEnabled: 'Benachrichtigungen aktiviert',
    notificationsDisabled: 'Benachrichtigungen deaktiviert',
    notificationsEnabledDescription: 'Sie erhalten Erinnerungen nach {hours}+ Stunden und tägliche Reminders',
    notificationsDisabledDescription: 'Sie erhalten keine Erinnerungen mehr',
    notificationsError: 'Benachrichtigungen konnten nicht aktiviert werden',
    
    minimumMealInterval: 'Mindestabstand zwischen Mahlzeiten',
    minimumMealIntervalDesc: 'Legen Sie Ihren gewünschten Mindestabstand zwischen Mahlzeiten fest',
    minimumMealIntervalValidation: 'Bitte geben Sie eine Zahl zwischen {min} und {max} ein',
    currentInterval: 'Aktueller Abstand',
    saveInterval: 'Abstand speichern',
    
    quietHours: 'Ruhezeiten',
    quietHoursDesc: 'Keine Benachrichtigungen während dieser Zeiten',
    quietHoursStart: 'Startzeit',
    quietHoursEnd: 'Endzeit',
    quietHoursValidation: 'Bitte geben Sie gültige Stunden (0-23) ein',
    saveQuietHours: 'Ruhezeiten speichern',
    
    editLastMeal: 'Letzte Mahlzeit bearbeiten',
    editLastMealDesc: 'Passen Sie Datum und Uhrzeit Ihrer letzten Mahlzeit an',
    selectDate: 'Datum wählen',
    selectTime: 'Uhrzeit wählen',
    saveChanges: 'Änderungen speichern',
    cancel: 'Abbrechen',
    
    mealHistory: 'Mahlzeitenverlauf',
    mealHistoryDesc: 'Alle erfassten Mahlzeiten ansehen und verwalten',
    clearHistory: 'Verlauf löschen',
    clearHistoryConfirm: 'Möchten Sie wirklich den gesamten Mahlzeitenverlauf löschen?',
    noHistory: 'Noch keine Mahlzeiten erfasst',
    ago: 'her',
    
    // Notifications
    notificationTitle: 'Mahlzeiten-Erinnerung',
    notificationBody: 'Es sind {hours} Stunden seit Ihrer letzten Mahlzeit vergangen',
    reminderTitle: 'Zeit zum Essen!',
    reminderBody: 'Sie haben Ihren {hours}-Stunden-Abstand erreicht',
    
    // Messages
    saved: 'Einstellungen gespeichert',
    error: 'Ein Fehler ist aufgetreten',
    success: 'Erfolgreich',
  },
  
  es: {
    // Navigation & Settings
    settings: 'Configuración',
    language: 'Idioma',
    
    // Home Page
    trackMeal: 'Registrar comida',
    timeSinceLastMeal: 'Tiempo desde la última comida',
    noMealTracked: 'Aún no se ha registrado ninguna comida',
    hours: 'horas',
    minutes: 'minutos',
    
    // Settings Page
    pushNotifications: 'Notificaciones push',
    enableNotifications: 'Activar notificaciones',
    disableNotifications: 'Desactivar notificaciones',
    notificationsEnabled: 'Notificaciones activadas',
    notificationsDisabled: 'Notificaciones desactivadas',
    notificationsEnabledDescription: 'Recibirás recordatorios después de {hours}+ horas y recordatorios diarios',
    notificationsDisabledDescription: 'Ya no recibirás recordatorios',
    notificationsError: 'No se pudieron activar las notificaciones',
    
    minimumMealInterval: 'Intervalo mínimo entre comidas',
    minimumMealIntervalDesc: 'Establece el intervalo mínimo deseado entre comidas',
    minimumMealIntervalValidation: 'Por favor ingrese un número entre {min} y {max}',
    currentInterval: 'Intervalo actual',
    saveInterval: 'Guardar intervalo',
    
    quietHours: 'Horas de silencio',
    quietHoursDesc: 'Sin notificaciones durante estas horas',
    quietHoursStart: 'Hora de inicio',
    quietHoursEnd: 'Hora de fin',
    quietHoursValidation: 'Por favor ingrese horas válidas (0-23)',
    saveQuietHours: 'Guardar horas de silencio',
    
    editLastMeal: 'Editar última comida',
    editLastMealDesc: 'Ajusta la fecha y hora de tu última comida',
    selectDate: 'Seleccionar fecha',
    selectTime: 'Seleccionar hora',
    saveChanges: 'Guardar cambios',
    cancel: 'Cancelar',
    
    mealHistory: 'Historial de comidas',
    mealHistoryDesc: 'Ver y gestionar todas tus comidas registradas',
    clearHistory: 'Borrar todo el historial',
    clearHistoryConfirm: '¿Estás seguro de que quieres borrar todo el historial de comidas?',
    noHistory: 'Aún no hay comidas registradas',
    ago: 'hace',
    
    // Notifications
    notificationTitle: 'Recordatorio de comida',
    notificationBody: 'Han pasado {hours} horas desde tu última comida',
    reminderTitle: '¡Hora de comer!',
    reminderBody: 'Has alcanzado tu intervalo de {hours} horas',
    
    // Messages
    saved: 'Configuración guardada',
    error: 'Ha ocurrido un error',
    success: 'Éxito',
  },
};

export const STORAGE_KEY_LANGUAGE = 'mealtracker_language';

export function getStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE);
  if (stored === 'en' || stored === 'de' || stored === 'es') {
    return stored;
  }
  // Default to English
  return 'en';
}

export function setStoredLanguage(language: Language): void {
  localStorage.setItem(STORAGE_KEY_LANGUAGE, language);
}

export function getTranslations(language: Language): Translations {
  return translations[language];
}
