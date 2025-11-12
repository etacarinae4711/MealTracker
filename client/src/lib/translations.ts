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
  appSubtitle: string;
  trackMeal: string;
  timeSinceLastMeal: string;
  noMealTracked: string;
  noMealInstructions: string;
  hours: string;
  minutes: string;
  hoursShort: string;
  minutesShort: string;
  target: string;
  goalReached: string;
  progressToGoal: string;
  progressLabel: string;
  
  // Settings Page
  settingsTitle: string;
  settingsDescription: string;
  save: string;
  languageDesc: string;
  
  pushNotifications: string;
  pushNotificationsDesc: string;
  enableNotifications: string;
  disableNotifications: string;
  notificationsEnabled: string;
  notificationsDisabled: string;
  notificationsActive: string;
  notificationsEnabledDescription: string;
  notificationsEnabledDetailDesc: string;
  notificationsDisabledDescription: string;
  notificationsError: string;
  
  minimumMealInterval: string;
  minimumMealIntervalDesc: string;
  minimumMealIntervalValidation: string;
  minimumMealIntervalRange: string;
  currentInterval: string;
  saveInterval: string;
  
  quietHours: string;
  quietHoursDesc: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursValidation: string;
  saveQuietHours: string;
  
  editLastMeal: string;
  editLastMealDesc: string;
  lastMeal: string;
  noMealYet: string;
  noMealYetDesc: string;
  changeTime: string;
  selectDate: string;
  selectTime: string;
  saveChanges: string;
  cancel: string;
  date: string;
  time: string;
  
  mealHistory: string;
  mealHistoryDesc: string;
  showHistory: string;
  mealNumber: string;
  current: string;
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
    appSubtitle: 'Track the time since your last meal',
    trackMeal: 'Track Meal',
    timeSinceLastMeal: 'Time since last meal',
    noMealTracked: 'No meal tracked yet',
    noMealInstructions: 'Click "Track Meal" to begin',
    hours: 'hours',
    minutes: 'minutes',
    hoursShort: 'h',
    minutesShort: 'm',
    target: 'target',
    goalReached: 'Goal reached!',
    progressToGoal: '{percentage}% to {hours}-hour goal',
    progressLabel: 'Progress to {hours}-hour goal',
    
    // Settings Page
    settingsTitle: 'Settings',
    settingsDescription: 'Customize your preferences',
    save: 'Save',
    languageDesc: 'Choose your preferred language',
    
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Push notifications for reminders',
    enableNotifications: 'Enable Notifications',
    disableNotifications: 'Disable Notifications',
    notificationsEnabled: 'Notifications enabled',
    notificationsDisabled: 'Notifications disabled',
    notificationsActive: 'Notifications active',
    notificationsEnabledDescription: 'You will receive reminders after {hours}+ hours and daily reminders',
    notificationsEnabledDetailDesc: 'You will receive reminders after {hours}+ hours and daily reminders at 9:00 AM',
    notificationsDisabledDescription: 'You will no longer receive reminders',
    notificationsError: 'Could not enable notifications',
    
    minimumMealInterval: 'Target Time Between Meals',
    minimumMealIntervalDesc: 'How many hours should pass before you are reminded?',
    minimumMealIntervalValidation: 'Please enter a number between {min} and {max}',
    minimumMealIntervalRange: 'Choose between {min} and {max} hours',
    currentInterval: 'Current interval',
    saveInterval: 'Save Interval',
    
    quietHours: 'Quiet Hours',
    quietHoursDesc: 'No notifications during these hours',
    quietHoursStart: 'Start time',
    quietHoursEnd: 'End time',
    quietHoursValidation: 'Please enter valid hours (0-23)',
    saveQuietHours: 'Save Quiet Hours',
    
    editLastMeal: 'Edit Last Meal',
    editLastMealDesc: 'Update the time of your last meal',
    lastMeal: 'Last meal',
    noMealYet: 'No meal yet',
    noMealYetDesc: 'Please track a meal first',
    changeTime: 'Change time',
    selectDate: 'Select date',
    selectTime: 'Select time',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    date: 'Date',
    time: 'Time',
    
    mealHistory: 'Meal History',
    mealHistoryDesc: 'View all recorded meals',
    showHistory: 'Show history',
    mealNumber: 'Meal',
    current: 'Current',
    clearHistory: 'Clear All History',
    clearHistoryConfirm: 'Are you sure you want to clear all meal history?',
    noHistory: 'No meals recorded yet',
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
    appSubtitle: 'Verfolgen Sie die Zeit seit Ihrer letzten Mahlzeit',
    trackMeal: 'Mahlzeit tracken',
    timeSinceLastMeal: 'Zeit seit letzter Mahlzeit',
    noMealTracked: 'Noch keine Mahlzeit erfasst',
    noMealInstructions: 'Klicken Sie auf "Mahlzeit tracken" um zu beginnen',
    hours: 'Stunden',
    minutes: 'Minuten',
    hoursShort: 'h',
    minutesShort: 'm',
    target: 'Ziel',
    goalReached: 'Ziel erreicht!',
    progressToGoal: '{percentage}% bis zum {hours}-Stunden-Ziel',
    progressLabel: 'Fortschritt bis zum {hours}-Stunden-Ziel',
    
    // Settings Page
    settingsTitle: 'Einstellungen',
    settingsDescription: 'Passen Sie Ihre Präferenzen an',
    save: 'Speichern',
    languageDesc: 'Wählen Sie Ihre bevorzugte Sprache',
    
    pushNotifications: 'Push-Benachrichtigungen',
    pushNotificationsDesc: 'Push-Benachrichtigungen für Erinnerungen',
    enableNotifications: 'Benachrichtigungen aktivieren',
    disableNotifications: 'Benachrichtigungen deaktivieren',
    notificationsEnabled: 'Benachrichtigungen aktiviert',
    notificationsDisabled: 'Benachrichtigungen deaktiviert',
    notificationsActive: 'Benachrichtigungen aktiv',
    notificationsEnabledDescription: 'Sie erhalten Erinnerungen nach {hours}+ Stunden und tägliche Reminders',
    notificationsEnabledDetailDesc: 'Sie erhalten Erinnerungen nach {hours}+ Stunden und tägliche Reminders um 9:00 Uhr',
    notificationsDisabledDescription: 'Sie erhalten keine Erinnerungen mehr',
    notificationsError: 'Benachrichtigungen konnten nicht aktiviert werden',
    
    minimumMealInterval: 'Zielzeit zwischen zwei Mahlzeiten',
    minimumMealIntervalDesc: 'Nach wie vielen Stunden möchten Sie erinnert werden?',
    minimumMealIntervalValidation: 'Bitte geben Sie eine Zahl zwischen {min} und {max} ein',
    minimumMealIntervalRange: 'Wählen Sie zwischen {min} und {max} Stunden',
    currentInterval: 'Aktueller Abstand',
    saveInterval: 'Abstand speichern',
    
    quietHours: 'Ruhezeiten',
    quietHoursDesc: 'Keine Benachrichtigungen während dieser Zeiten',
    quietHoursStart: 'Startzeit',
    quietHoursEnd: 'Endzeit',
    quietHoursValidation: 'Bitte geben Sie gültige Stunden (0-23) ein',
    saveQuietHours: 'Ruhezeiten speichern',
    
    editLastMeal: 'Letzte Mahlzeit bearbeiten',
    editLastMealDesc: 'Aktualisieren Sie die Zeit Ihrer letzten Mahlzeit',
    lastMeal: 'Letzte Mahlzeit',
    noMealYet: 'Keine Mahlzeit',
    noMealYetDesc: 'Bitte tracken Sie zuerst eine Mahlzeit',
    changeTime: 'Zeit ändern',
    selectDate: 'Datum wählen',
    selectTime: 'Uhrzeit wählen',
    saveChanges: 'Änderungen speichern',
    cancel: 'Abbrechen',
    date: 'Datum',
    time: 'Uhrzeit',
    
    mealHistory: 'Mahlzeiten-Historie',
    mealHistoryDesc: 'Alle aufgezeichneten Mahlzeiten anzeigen',
    showHistory: 'Historie anzeigen',
    mealNumber: 'Mahlzeit',
    current: 'Aktuell',
    clearHistory: 'Verlauf löschen',
    clearHistoryConfirm: 'Möchten Sie wirklich den gesamten Mahlzeitenverlauf löschen?',
    noHistory: 'Noch keine Mahlzeiten aufgezeichnet',
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
    appSubtitle: 'Rastrea el tiempo desde tu última comida',
    trackMeal: 'Registrar comida',
    timeSinceLastMeal: 'Tiempo desde la última comida',
    noMealTracked: 'Aún no se ha registrado ninguna comida',
    noMealInstructions: 'Haz clic en "Registrar comida" para comenzar',
    hours: 'horas',
    minutes: 'minutos',
    hoursShort: 'h',
    minutesShort: 'm',
    target: 'objetivo',
    goalReached: '¡Objetivo alcanzado!',
    progressToGoal: '{percentage}% hasta el objetivo de {hours} horas',
    progressLabel: 'Progreso hasta el objetivo de {hours} horas',
    
    // Settings Page
    settingsTitle: 'Configuración',
    settingsDescription: 'Personaliza tus preferencias',
    save: 'Guardar',
    languageDesc: 'Elige tu idioma preferido',
    
    pushNotifications: 'Notificaciones push',
    pushNotificationsDesc: 'Notificaciones push para recordatorios',
    enableNotifications: 'Activar notificaciones',
    disableNotifications: 'Desactivar notificaciones',
    notificationsEnabled: 'Notificaciones activadas',
    notificationsDisabled: 'Notificaciones desactivadas',
    notificationsActive: 'Notificaciones activas',
    notificationsEnabledDescription: 'Recibirás recordatorios después de {hours}+ horas y recordatorios diarios',
    notificationsEnabledDetailDesc: 'Recibirás recordatorios después de {hours}+ horas y recordatorios diarios a las 9:00',
    notificationsDisabledDescription: 'Ya no recibirás recordatorios',
    notificationsError: 'No se pudieron activar las notificaciones',
    
    minimumMealInterval: 'Tiempo objetivo entre comidas',
    minimumMealIntervalDesc: '¿Cuántas horas deben pasar antes de ser recordado?',
    minimumMealIntervalValidation: 'Por favor ingrese un número entre {min} y {max}',
    minimumMealIntervalRange: 'Elige entre {min} y {max} horas',
    currentInterval: 'Intervalo actual',
    saveInterval: 'Guardar intervalo',
    
    quietHours: 'Horas de silencio',
    quietHoursDesc: 'Sin notificaciones durante estas horas',
    quietHoursStart: 'Hora de inicio',
    quietHoursEnd: 'Hora de fin',
    quietHoursValidation: 'Por favor ingrese horas válidas (0-23)',
    saveQuietHours: 'Guardar horas de silencio',
    
    editLastMeal: 'Editar última comida',
    editLastMealDesc: 'Actualiza la hora de tu última comida',
    lastMeal: 'Última comida',
    noMealYet: 'Sin comida todavía',
    noMealYetDesc: 'Por favor registra una comida primero',
    changeTime: 'Cambiar hora',
    selectDate: 'Seleccionar fecha',
    selectTime: 'Seleccionar hora',
    saveChanges: 'Guardar cambios',
    cancel: 'Cancelar',
    date: 'Fecha',
    time: 'Hora',
    
    mealHistory: 'Historial de comidas',
    mealHistoryDesc: 'Ver todas las comidas registradas',
    showHistory: 'Mostrar historial',
    mealNumber: 'Comida',
    current: 'Actual',
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
