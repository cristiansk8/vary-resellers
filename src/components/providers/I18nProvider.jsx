'use client';

import { useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

export function I18nProvider({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if i18n is ready
    const checkI18n = () => {
      if (i18n.isInitialized) {
        setIsReady(true);
      } else {
        // If not ready, check again in a short interval
        setTimeout(checkI18n, 50);
      }
    };

    checkI18n();

    return () => {
      // Cleanup any pending timeouts
      setIsReady(false);
    };
  }, []);

  if (!isReady) {
    // Return empty fragment while i18n is initializing
    return <></>;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}