'use client';

import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import RegisterForm from '@/components/register-form';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { validateInvitationToken } from '@/lib/api/auth';

interface ValidationState {
  isValid: boolean | null;
  email: string | null;
  error: string | null;
}

export function AcceptInvitationForm() {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: null,
    email: null,
    error: null,
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setValidationState({
        isValid: false,
        email: null,
        error: t('invalidInvitationLink'),
      });
      return;
    }

    const validateToken = async () => {
      try {
        const { isValid, email, error } = await validateInvitationToken(token);
        setValidationState({ isValid, email, error });
        if (!isValid) {
          toast.error(error || t('invalidOrExpiredInvitation'));
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setValidationState({
          isValid: false,
          email: null,
          error: t('errorValidatingInvitation'),
        });
        toast.error(t('errorValidatingInvitation'));
      }
    };

    validateToken();
  }, [searchParams, t]);

  if (validationState.isValid === null) {
    return <LoadingSpinner message={t('validatingInvitation')} />;
  }

  if (validationState.isValid === false) {
    return (
      <ErrorMessage
        message={validationState.error || t('invalidOrExpiredInvitation')}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t('completeYourRegistration')}
      </h1>
      <RegisterForm initialEmail={validationState.email} />
    </div>
  );
}
