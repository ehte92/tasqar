import type { Metadata } from 'next';

import { NextLoader } from '@/components/next-loader';

import { Document } from './document';

export const metadata: Metadata = {
  title: 'Tasqar - Collaborative Task Management',
  description: 'Efficiently manage and collaborate on tasks with Tasqar',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Document>
      <NextLoader />
      {children}
    </Document>
  );
}
