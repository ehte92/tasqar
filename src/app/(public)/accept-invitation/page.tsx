'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import RegisterForm from '@/components/register-form';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid invitation link');
      setIsValidToken(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(
          `/api/invite/validate?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (response.ok) {
          setIsValidToken(true);
          setEmail(data.email);
        } else {
          setError(data.error || 'Invalid or expired invitation');
          setIsValidToken(false);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setError('An error occurred while validating the invitation');
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [searchParams]);

  if (isValidToken === null) {
    return <div>Validating invitation...</div>;
  }

  if (isValidToken === false) {
    return (
      <div className="text-center text-red-600">
        {error ||
          'Invalid or expired invitation. Please request a new invitation.'}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-center">
        Complete Your Registration
      </h1>
      <RegisterForm initialEmail={email} />
    </div>
  );
}
