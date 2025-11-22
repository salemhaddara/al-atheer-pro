import { translations } from '../locales';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

/**
 * Server-side translation function
 * Can be used in Server Components
 */
export function getTranslation(language: Language, key: string): string {
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
}

/**
 * Get direction based on language
 */
export function getDirection(language: Language): Direction {
  return language === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Get language from cookies (for server components)
 */
export function getLanguageFromCookies(cookies: any): Language {
  const lang = cookies.get('language')?.value;
  return (lang === 'ar' || lang === 'en') ? lang : 'ar';
}

