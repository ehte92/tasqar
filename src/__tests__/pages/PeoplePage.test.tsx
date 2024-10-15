import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

import PeoplePage from '@/app/(authenticated)/people/page';

// Mock the components and hooks
jest.mock('@/components/layouts/content-layout', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content-layout">{children}</div>
  ),
}));

jest.mock('@/components/people/people-list', () => ({
  PeopleList: () => <div data-testid="people-list">PeopleList</div>,
}));

jest.mock('@/components/people/add-connection-dialog', () => ({
  AddConnectionDialog: () => <button>Add Connection</button>,
}));

jest.mock('@/hooks/use-background-sync', () => ({
  useBackgroundSync: jest.fn(),
}));

describe('PeoplePage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  const renderPeoplePage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={null}>
          <PeoplePage />
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  it('renders the PeoplePage with correct layout and components', async () => {
    renderPeoplePage();

    await waitFor(() => {
      expect(screen.getByTestId('content-layout')).toBeInTheDocument();
      expect(screen.getByText('People')).toBeInTheDocument();
      expect(screen.getByText('Add Connection')).toBeInTheDocument();
      expect(screen.getByTestId('people-list')).toBeInTheDocument();
    });
  });

  it('displays correct statistics cards', async () => {
    renderPeoplePage();

    await waitFor(() => {
      expect(screen.getByText('Total Connections')).toBeInTheDocument();
      expect(screen.getByText('+2350')).toBeInTheDocument();
      expect(screen.getByText('+180 from last month')).toBeInTheDocument();

      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      expect(screen.getByText('+12')).toBeInTheDocument();
      expect(screen.getByText('-3 from last week')).toBeInTheDocument();
    });
  });

  it('calls useBackgroundSync with correct parameters', () => {
    const mockUseBackgroundSync = jest.requireMock(
      '@/hooks/use-background-sync'
    ).useBackgroundSync;
    renderPeoplePage();

    expect(mockUseBackgroundSync).toHaveBeenCalledWith(['connections'], 300000);
  });
});
