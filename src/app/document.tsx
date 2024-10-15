'use client';

import localFont from 'next/font/local';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { useLocale } from '@/lib/i18n/useLocale';
import { ReactNode } from 'react';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const Document = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();

  return (
    <html lang={locale?.lang} dir={locale?.dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
};
