'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from '@/locales/en/translation.json';
import translationES from '@/locales/es/translation.json';
import translationFR from '@/locales/fr/translation.json';
import translationPT from '@/locales/pt/translation.json';

// Only initialize i18n if it hasn't been initialized yet
if (!i18n.isInitialized) {
  const resources = {
    en: {
      translation: translationEN,
    },
    es: {
      translation: translationES,
    },
    fr: {
      translation: translationFR,
    },
    pt: {
      translation: translationPT,
    },
  };

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'es',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
      // Ensure initialization is complete before use
      initImmediate: false,
    });
}

export default i18n;