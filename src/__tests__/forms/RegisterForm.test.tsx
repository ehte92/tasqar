import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/register-form';
import { toast } from 'sonner';

// Mock the necessary dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('RegisterForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    global.fetch = jest.fn();
  });

  const renderRegisterForm = (initialEmail?: string | null) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={null}>
          <RegisterForm initialEmail={initialEmail} />
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  it('renders the register form with correct fields and button', () => {
    renderRegisterForm();

    expect(screen.getByText('Complete Your Registration')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeInTheDocument();
  });

  it('displays validation errors for invalid inputs', async () => {
    renderRegisterForm();

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 2 characters')
      ).toBeInTheDocument();
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      expect(
        screen.getByText('Password must be at least 8 characters')
      ).toBeInTheDocument();
    });
  });

  it('submits the form with valid inputs and handles successful registration', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Registration successful!' }),
    });

    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    renderRegisterForm();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      });
      expect(toast.success).toHaveBeenCalledWith('Registration successful!');
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('handles registration error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Registration failed' }),
    });

    renderRegisterForm();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Registration failed');
    });
  });

  it('disables email input when initialEmail is provided', () => {
    renderRegisterForm('test@example.com');

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.disabled).toBe(true);
    expect(emailInput.value).toBe('test@example.com');
  });
});
