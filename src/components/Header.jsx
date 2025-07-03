"use client";
import Link from 'next/link';
import { ShieldCheck, Menu, X, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useUserContext } from '@/store/ui/userContext';
import HeaderLogoutButton from './HeaderLogoutButton';

const Header = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useSupabaseUser();
  const isLoading = user === undefined;
  const { userName } = useUserContext();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm print:hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <ShieldCheck className="h-8 w-8 sm:h-9 sm:w-9 text-blue-700" />
          <span className="text-2xl sm:text-3xl font-bold text-blue-800 tracking-tight">
            Vacun<span className="text-sky-600">.org</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-2">
          <LanguageSelector />
          {!isLoading && (
            userName ? (
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1 text-blue-800 font-semibold hover:underline hover:text-blue-900 transition-colors">
                <UserIcon className="w-5 h-5 text-blue-700" />
                {userName}
              </Link>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/sign-in">{t('login')}</Link>
              </Button>
            )
          )}
          {userName ? (
            <HeaderLogoutButton />
          ) : (
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" asChild>
              <Link href="/sign-up">{t('register')}</Link>
            </Button>
          )}
        </nav>
        <div className="md:hidden flex items-center">
          <LanguageSelector />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-700 hover:bg-sky-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" aria-label="Close menu" /> : <Menu className="h-6 w-6" aria-label="Open menu" />}
          </Button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 z-40 pb-4"
        >
          <nav className="flex flex-col items-center space-y-3 pt-3">
            {!isLoading && (
              userName ? (
                <span className="px-3 py-1 text-blue-800 font-semibold">{userName}</span>
              ) : (
                <Button variant="ghost" asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/sign-in">{t('login')}</Link>
                </Button>
              )
            )}
            {userName ? (
              <Button className="w-11/12 mx-auto bg-blue-700 hover:bg-blue-800 text-white" asChild onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/logout">{t('logout')}</Link>
              </Button>
            ) : (
              <Button className="w-11/12 mx-auto bg-blue-700 hover:bg-blue-800 text-white" asChild onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/sign-up">{t('register')}</Link>
              </Button>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
