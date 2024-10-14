import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';

// Mock the hooks and components
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/layouts/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock('@/hooks/use-sidebar-toggle', () => ({
  useSidebarToggle: jest.fn().mockReturnValue({ isOpen: true }),
}));

describe('AuthenticatedLayout', () => {
  const mockPush = jest.fn();
  const mockChildren = <div>Test Children</div>;

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders loading spinner when session status is loading', () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'loading' });

    render(<AuthenticatedLayout>{mockChildren}</AuthenticatedLayout>);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Test Children')).not.toBeInTheDocument();
  });

  it('redirects to login page when user is unauthenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'unauthenticated' });

    render(<AuthenticatedLayout>{mockChildren}</AuthenticatedLayout>);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('renders children and sidebar when user is authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });

    render(<AuthenticatedLayout>{mockChildren}</AuthenticatedLayout>);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('applies correct classes based on sidebar state', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });

    render(<AuthenticatedLayout>{mockChildren}</AuthenticatedLayout>);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('lg:ml-60');
    expect(mainElement).not.toHaveClass('lg:ml-[90px]');
  });
});
