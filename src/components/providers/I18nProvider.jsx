// En: src/components/providers/I18nProvider.jsx

'use client'; // Le dice a Next.js: "Este es un componente de cliente"

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n'; // Importa tu configuración desde src/i18n.js

export function I18nProvider({ children }) {
  // Este componente envuelve a tus hijos con el proveedor oficial de i18next,
  // pasándole tu configuración.
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}