/**
 * Language Hook
 * 
 * Provides language selection and translations throughout the app
 */

import { useState, useEffect, createContext, useContext } from 'react';
import type { Language, Translations } from '@/lib/translations';
import { getStoredLanguage, setStoredLanguage, getTranslations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export function useLanguageState() {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage());
  const [t, setT] = useState<Translations>(getTranslations(language));

  useEffect(() => {
    setT(getTranslations(language));
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
  };

  return { language, setLanguage, t };
}
