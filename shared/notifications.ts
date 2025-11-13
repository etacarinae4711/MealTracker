export type NotificationLanguage = 'en' | 'de' | 'es';

export interface NotificationTranslations {
  threeHourReminder: {
    title: string;
    body: (hours: number) => string;
  };
}

export const notificationTranslations: Record<NotificationLanguage, NotificationTranslations> = {
  en: {
    threeHourReminder: {
      title: "Mealtracker Reminder",
      body: (hours: number) => `Last meal was ${hours} hours ago`,
    },
  },
  de: {
    threeHourReminder: {
      title: "Mealtracker Erinnerung",
      body: (hours: number) => `Letzte Mahlzeit war vor ${hours} Stunden`,
    },
  },
  es: {
    threeHourReminder: {
      title: "Recordatorio Mealtracker",
      body: (hours: number) => `Última comida fue hace ${hours} horas`,
    },
  },
};

export function getNotificationText(
  language: string | null | undefined,
  hours: number
): { title: string; body: string } {
  // Validate language is one of the supported values, fallback to English
  const lang: NotificationLanguage = 
    language === 'en' || language === 'de' || language === 'es' 
      ? language 
      : 'en';
  
  const translations = notificationTranslations[lang];
  
  return {
    title: translations.threeHourReminder.title,
    body: translations.threeHourReminder.body(hours),
  };
}
