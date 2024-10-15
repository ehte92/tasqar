import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import KanbanBoard from '@/components/dashboard/kanban-board';
import * as projectService from '@/services/project-service';
import * as taskService from '@/services/task-service';

// Mock the services
jest.mock('@/services/task-service');
jest.mock('@/services/project-service');

// Mock the DnD context
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock the createPortal function
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('KanbanBoard', () => {
  const mockSession = {
    user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
    expires: '2023-01-01',
  };

  const mockTasks = [
    { id: '1', title: 'Task 1', status: 'TODO', userId: 'user1' },
    { id: '2', title: 'Task 2', status: 'IN_PROGRESS', userId: 'user1' },
  ];

  const mockProjects = [
    { id: '1', name: 'Project 1', description: 'Test project 1' },
    { id: '2', name: 'Project 2', description: 'Test project 2' },
  ];

  beforeEach(() => {
    // Mock the service functions
    (taskService.useTasks as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
    });
    (projectService.useProjects as jest.Mock).mockReturnValue({
      data: mockProjects,
      isLoading: false,
    });
  });

  const renderKanbanBoard = () => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={mockSession as Session}>
          <KanbanBoard />
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  it('renders the KanbanBoard component with columns', async () => {
    renderKanbanBoard();

    await waitFor(() => {
      expect(screen.getByText('My Tasks')).toBeInTheDocument();
      expect(screen.getByText('Project Overview')).toBeInTheDocument();
      expect(screen.getByText('People')).toBeInTheDocument();
    });
  });

  it('displays tasks in the "My Tasks" column', async () => {
    renderKanbanBoard();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  it('displays projects in the "Project Overview" column', async () => {
    renderKanbanBoard();

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });
  });

  it('displays "People feature coming soon..." in the "People" column', async () => {
    renderKanbanBoard();

    await waitFor(() => {
      expect(
        screen.getByText('People feature coming soon...')
      ).toBeInTheDocument();
    });
  });

  // Add more tests as needed for specific interactions and edge cases
});
