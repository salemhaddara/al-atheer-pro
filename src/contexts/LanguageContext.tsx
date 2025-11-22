'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation object will be imported
import { translations } from '../locales';

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage = 'ar' }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // On server, use initialLanguage
    if (typeof window === 'undefined') {
      return initialLanguage;
    }
    // On client, prioritize initialLanguage (from cookies) over localStorage
    // This ensures server and client are in sync
    return initialLanguage;
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  // Sync with localStorage on mount (for backward compatibility)
  // But only if it differs from initialLanguage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('language');
    // Only use localStorage if it's different from server-provided language
    // This allows user preference to override on subsequent visits
    if (saved === 'ar' || saved === 'en') {
      if (saved !== initialLanguage) {
        setLanguageState(saved);
      }
    }
  }, [initialLanguage]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Save to localStorage
    localStorage.setItem('language', language);

    // Save to cookies for server-side access
    document.cookie = `language=${language}; path=/; max-age=31536000`; // 1 year

    // Update document direction and lang attributes
    document.documentElement.dir = direction;
    document.documentElement.lang = language;

    // Update body class for RTL-specific styling
    if (direction === 'rtl') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [language, direction]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  // Translation function with nested key support - memoized for performance
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation key not found: ${key}`);
        }
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }, [language]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language,
    direction,
    setLanguage,
    t
  }), [language, direction, setLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for using the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

