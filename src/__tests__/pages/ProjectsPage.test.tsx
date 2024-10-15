import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

import ProjectsPage from '@/app/(authenticated)/projects/page';
import * as projectService from '@/services/project-service';

// Mock the components and hooks
jest.mock('@/components/layouts/content-layout', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content-layout">{children}</div>
  ),
}));

jest.mock('@/components/projects/data-table', () => ({
  DataTable: () => <div data-testid="data-table">DataTable</div>,
}));

jest.mock('@/components/projects/create-project-button', () => ({
  CreateProjectButton: () => <button>Create Project</button>,
}));

jest.mock('@/hooks/use-background-sync', () => ({
  useBackgroundSync: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-id' } } }),
}));

jest.mock('@/services/project-service', () => ({
  useProjects: jest.fn(),
}));

describe('ProjectsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    (projectService.useProjects as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  const renderProjectsPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={null}>
          <ProjectsPage />
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  it('renders the ProjectsPage with correct layout and components', async () => {
    renderProjectsPage();

    await waitFor(() => {
      expect(screen.getByTestId('content-layout')).toBeInTheDocument();
      expect(screen.getByText('Your Projects')).toBeInTheDocument();
      expect(screen.getByText('Create Project')).toBeInTheDocument();
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
  });

  it('displays loading spinner when projects are loading', async () => {
    (projectService.useProjects as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
    });

    renderProjectsPage();

    await waitFor(() => {
      expect(screen.getByTestId('content-layout')).toBeInTheDocument();
      expect(screen.getByText('Your Projects')).toBeInTheDocument();
      expect(screen.getByText('Create Project')).toBeInTheDocument();
      expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
    });
  });

  it('calls useBackgroundSync with correct parameters', () => {
    const mockUseBackgroundSync = jest.requireMock(
      '@/hooks/use-background-sync'
    ).useBackgroundSync;
    renderProjectsPage();

    expect(mockUseBackgroundSync).toHaveBeenCalledWith(
      ['projects', 'user-id'],
      300000
    );
  });
});
