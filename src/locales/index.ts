import ar from './ar.json';
import en from './en.json';

export const translations = {
    ar,
    en,
} as const;

export type TranslationKeys = typeof ar;

