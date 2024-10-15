'use client';

import React from 'react';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import LanguageSwitcher from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation('landing');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Icons.logo className="w-8 h-8" />
              <span className="text-2xl font-bold">{t('appName')}</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button
                asChild
                variant="ghost"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Link href="/login">{t('login')}</Link>
              </Button>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/register">{t('getStarted')}</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-300">
          © {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}
        </div>
      </footer>
    </div>
  );
}
