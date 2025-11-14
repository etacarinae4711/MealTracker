/**
 * Language Selection Hook
 * 
 * Provides language selection and translations throughout the app.
 * Manages:
 * - Current language selection (en, de, es)
 * - Language persistence in localStorage
 * - Translation object for current language
 * 
 * Usage in components:
 * - useLanguage() - Access from within LanguageProvider context
 * - useLanguageState() - Create new language state (typically for provider)
 * 
 * @module use-language
 */

import { useState, useEffect, createContext, useContext } from 'react';
import type { Language, Translations } from '@/lib/translations';
import { getStoredLanguage, setStoredLanguage, getTranslations } from '@/lib/translations';

/**
 * Context type for language management
 */
interface LanguageContextType {
  /** Current selected language ('en', 'de', 'es') */
  language: Language;
  
  /** Function to change language */
  setLanguage: (lang: Language) => void;
  
  /** Current translations object */
  t: Translations;
}

/**
 * Context for language state
 * Use with useLanguage() hook to access language and translations
 */
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Hook to access language context
 * 
 * Must be used within a component wrapped by LanguageProvider.
 * 
 * @returns {Object} Language context with current language, translations, and setter
 * @returns {Language} return.language - Current language code ('en', 'de', 'es')
 * @returns {Function} return.setLanguage - Function to change language
 * @returns {Translations} return.t - All translations for current language
 * 
 * @throws {Error} If used outside of LanguageProvider
 * 
 * @example
 * function MyComponent() {
 *   const { language, t, setLanguage } = useLanguage();
 *   
 *   return (
 *     <div>
 *       <h1>{t.appTitle}</h1>
 *       <button onClick={() => setLanguage('de')}>Deutsch</button>
 *     </div>
 *   );
 * }
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

/**
 * Hook to create language state
 * 
 * Initializes language from localStorage and provides state management.
 * Typically used once in the App component to create the provider value.
 * 
 * @returns {Object} Language state
 * @returns {Language} return.language - Current language
 * @returns {Function} return.setLanguage - Update language (saves to localStorage)
 * @returns {Translations} return.t - Translations for current language
 * 
 * @example
 * // In App.tsx
 * function App() {
 *   const languageState = useLanguageState();
 *   
 *   return (
 *     <LanguageContext.Provider value={languageState}>
 *       <MyComponents />
 *     </LanguageContext.Provider>
 *   );
 * }
 */
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
