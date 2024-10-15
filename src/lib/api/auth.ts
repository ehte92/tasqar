import { RegisterFormValues } from '@/components/register-form';

export async function registerUser(values: RegisterFormValues): Promise<any> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }

  return response.json();
}

export async function verifyEmail(token: string): Promise<any> {
  const response = await fetch(`/api/auth/verify-email?token=${token}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Email verification failed');
  }
  return response.json();
}

export async function validateInvitationToken(token: string): Promise<{
  isValid: boolean;
  email: string | null;
  error: string | null;
}> {
  try {
    const response = await fetch(
      `/api/invite/validate?token=${encodeURIComponent(token)}`
    );
    const data = await response.json();

    if (response.ok) {
      return { isValid: true, email: data.email, error: null };
    } else {
      return {
        isValid: false,
        email: null,
        error: data.error || 'Invalid or expired invitation',
      };
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return {
      isValid: false,
      email: null,
      error: 'An error occurred while validating the invitation',
    };
  }
}
