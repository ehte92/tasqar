'use client';

import { Suspense } from 'react';

import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { AcceptInvitationForm } from './accept-invitation-form';

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <AcceptInvitationForm />
    </Suspense>
  );
}
