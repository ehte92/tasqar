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
