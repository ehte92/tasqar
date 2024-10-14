import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import TasksPage from '@/app/(authenticated)/tasks/page';
import * as taskService from '@/services/task-service';

// Mock the components and hooks
jest.mock('@/components/layouts/content-layout', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content-layout">{children}</div>
  ),
}));

jest.mock('@/components/tasks/data-table', () => ({
  DataTable: () => <div data-testid="data-table">DataTable</div>,
}));

jest.mock('@/components/dashboard/create-task-dialog', () => ({
  CreateTaskDialog: ({
    onClose,
    onCreateTask,
  }: {
    onClose: () => void;
    onCreateTask: (task: any) => void;
  }) => (
    <div data-testid="create-task-dialog">
      <button onClick={() => onCreateTask({ title: 'New Task' })}>
        Create Task
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('@/hooks/use-background-sync', () => ({
  useBackgroundSync: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-id' } } }),
}));

jest.mock('@/services/task-service', () => ({
  useTasks: jest.fn(),
  createTask: jest.fn(),
}));

describe('TasksPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    (taskService.useTasks as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  const renderTasksPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={null}>
          <TasksPage />
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  it('renders the TasksPage with correct layout and components', () => {
    renderTasksPage();

    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
    expect(screen.getByText('Add task')).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('opens the CreateTaskDialog when "Add task" button is clicked', async () => {
    renderTasksPage();

    fireEvent.click(screen.getByText('Add task'));

    await waitFor(() => {
      expect(screen.getByTestId('create-task-dialog')).toBeInTheDocument();
    });
  });

  it('creates a new task when submitted through the dialog', async () => {
    const mockCreateTask = jest
      .fn()
      .mockResolvedValue({ id: '1', title: 'New Task' });
    (taskService.createTask as jest.Mock).mockImplementation(mockCreateTask);

    renderTasksPage();

    fireEvent.click(screen.getByText('Add task'));

    await waitFor(() => {
      expect(screen.getByTestId('create-task-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'New Task',
        userId: 'user-id',
      });
    });

    expect(screen.queryByTestId('create-task-dialog')).not.toBeInTheDocument();
  });
});
