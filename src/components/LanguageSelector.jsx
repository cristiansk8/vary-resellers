// src/components/LanguageSelector.jsx

'use client'; // <-- SOLUCIÓN 1: Marcamos como componente de cliente

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // <-- SOLUCIÓN 2: Hacemos el código más robusto
  const langCode = i18n.language || '';
  const currentLanguage = languages.find(lang => lang.code === langCode) ||
                         languages.find(lang => lang.code === langCode.split('-')[0]) ||
                         languages[1]; // Fallback a 'Español'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center text-xs sm:text-sm border-slate-300 text-slate-700 hover:bg-slate-100">
          <Globe className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {/* Nos aseguramos que currentLanguage no sea undefined antes de acceder a sus propiedades */}
          {currentLanguage?.flag} <span className="hidden sm:inline ml-1">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white shadow-lg rounded-md border border-slate-200">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer px-3 py-2 text-sm hover:bg-slate-100 ${langCode.startsWith(lang.code) ? 'bg-slate-100 font-semibold' : ''}`}
          >
            <span className="mr-2">{lang.flag}</span> {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;