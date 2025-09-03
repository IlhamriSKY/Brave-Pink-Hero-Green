import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import en from './locales/en.json'
import id from './locales/id.json'
import ms from './locales/ms.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'

/**
 * Internationalization (i18n) Configuration
 *
 * Sets up i18next with React integration for multi-language support.
 *
 * Features:
 * - 5 language support: Indonesian (default), Bahasa Malaysia, English, Japanese, Chinese
 * - Automatic browser language detection
 * - LocalStorage persistence
 * - React hooks integration
 * - Fallback language handling
 *
 * @see {@link https://react.i18next.com/} React i18next Documentation
 * @see {@link https://www.i18next.com/} i18next Documentation
 */

const resources = {
  en: { translation: en },
  id: { translation: id },
  ms: { translation: ms },
  ja: { translation: ja },
  zh: { translation: zh },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id', // Indonesian as default
    debug: false,

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace and key separation
    ns: ['translation'],
    defaultNS: 'translation',

    // React i18next options
    react: {
      useSuspense: false,
    },
  })

export default i18n
