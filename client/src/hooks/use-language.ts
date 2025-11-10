/**
 * Language management hook for multi-language support
 * 
 * Manages the current language preference and provides translations.
 * Language preference is persisted in localStorage.
 * 
 * @module use-language
 */

import { useState, useEffect } from 'react';
import { Language, Translations, getTranslations, isValidLanguage } from '@/lib/translations';
import { STORAGE_KEYS, LANGUAGE_CONFIG } from '@/lib/constants';

/**
 * Custom hook for managing language state and translations
 * 
 * Features:
 * - Loads language preference from localStorage
 * - Defaults to English if no preference or invalid value
 * - Persists language changes to localStorage
 * - Provides current translations object
 * 
 * @returns Object containing current language, translations, and setter function
 * 
 * @example
 * const { language, t, setLanguage } = useLanguage();
 * 
 * // Use translations
 * <Button>{t.trackMeal}</Button>
 * 
 * // Change language
 * setLanguage('de');
 */
export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(LANGUAGE_CONFIG.DEFAULT);
  const [t, setTranslations] = useState<Translations>(getTranslations(LANGUAGE_CONFIG.DEFAULT));

  /**
   * Load language preference from localStorage on mount
   * 
   * Side effects:
   * - Reads from localStorage
   * - Validates stored value
   * - Falls back to default if invalid
   */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    
    if (stored && isValidLanguage(stored)) {
      setLanguageState(stored);
      setTranslations(getTranslations(stored));
    } else if (stored) {
      // Invalid language code stored, reset to default
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, LANGUAGE_CONFIG.DEFAULT);
    }
  }, []);

  /**
   * Update language preference
   * 
   * @param newLanguage - The new language to set (en, de, es)
   * 
   * Side effects:
   * - Updates component state
   * - Persists to localStorage
   * - Updates translations object
   */
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    setTranslations(getTranslations(newLanguage));
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
  };

  return {
    language,
    t,
    setLanguage,
  };
}
