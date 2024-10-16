'use client';

import { Suspense } from 'react';

import { Icons } from '@/components/ui/icons';

import VerifyEmailContent from './verify-email-content';

export default function VerifyEmail() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md text-center">
        <Icons.spinner className="h-16 w-16 text-blue-500 animate-spin mx-auto" />
        <p className="mt-4 text-lg">Verifying email...</p>
      </div>
    </div>
  );
}
