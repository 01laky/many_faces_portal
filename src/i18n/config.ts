/**
 * i18n/config.ts - Internationalization (i18n) configuration for Frontend Demo
 *
 * This file configures the i18next library for multi-language support.
 * It sets up:
 * - Language detection from browser/localStorage
 * - Translation resources for all supported languages
 * - React integration for i18n hooks
 *
 * Supported languages: English (en), Slovak (sk), Czech (cz)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files for all supported languages
import enTranslations from './locales/en.json';
import skTranslations from './locales/sk.json';
import czTranslations from './locales/cz.json';

// Supported languages array - defines all languages available in the application
// Using 'as const' makes this a readonly tuple for type safety
export const supportedLanguages = ['en', 'sk', 'cz'] as const;

// TypeScript type for supported languages - allows only values from supportedLanguages array
export type SupportedLanguage = (typeof supportedLanguages)[number];

// Configure i18next with plugins and settings
i18n
  // Add language detector plugin - automatically detects user's preferred language
  // Checks localStorage, browser navigator, and HTML lang attribute
  .use(LanguageDetector)
  // Add React integration plugin - enables useTranslation hook and other React features
  .use(initReactI18next)
  // Initialize i18next with configuration
  .init({
    // Default language - used when detection fails or language is not supported
    fallbackLng: 'en',
    // Supported languages - only these languages will be available
    supportedLngs: supportedLanguages,
    // Default namespace - namespace containing common translations
    defaultNS: 'common',
    // Namespaces - list of all translation namespaces
    ns: ['common'],
    // Resources with translations - maps language codes to their translation objects
    resources: {
      en: {
        common: enTranslations, // English translations
      },
      sk: {
        common: skTranslations, // Slovak translations
      },
      cz: {
        common: czTranslations, // Czech translations
      },
    },
    // React-specific options
    react: {
      // Disable suspense for better compatibility with older React versions
      // Suspense can cause issues with some React patterns
      useSuspense: false,
    },
    // Language detection options
    detection: {
      // Order of language detection methods (priority order)
      // 1. localStorage - check if user previously selected a language
      // 2. navigator - detect from browser language settings
      // 3. htmlTag - detect from HTML lang attribute
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache detected language in localStorage for future visits
      caches: ['localStorage'],
    },
    // Interpolation options - how to handle variables in translations
    interpolation: {
      // Don't escape values - React already handles XSS protection
      // This allows HTML in translations if needed
      escapeValue: false,
    },
  });

export default i18n;
