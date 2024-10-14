import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTaskDialog } from '@/components/dashboard/create-task-dialog';
import { TaskStatus, TaskPriority } from '@/types/task';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the next-auth/react module
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: 'user1', name: 'Test User', image: null } },
    status: 'authenticated',
  })),
}));

// Mock the project and connection services
jest.mock('@/services/project-service', () => ({
  useProjects: jest.fn(() => ({
    data: [{ id: 'project1', title: 'Test Project' }],
    isLoading: false,
  })),
}));

jest.mock('@/services/connection-service', () => ({
  useConnections: jest.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

describe('CreateTaskDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnCreateTask = jest.fn();

  const renderComponent = () => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={null}>
          <CreateTaskDialog
            isOpen={true}
            onClose={mockOnClose}
            onCreateTask={mockOnCreateTask}
          />
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  it('renders the dialog with all form fields', () => {
    renderComponent();

    expect(screen.getByPlaceholderText('Task name')).toBeInTheDocument();
    expect(screen.getByText('Assignee')).toBeInTheDocument();
    expect(screen.getByText('Due date')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('allows user to input task details and create a task', async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Task name'), {
      target: { value: 'New Test Task' },
    });

    fireEvent.click(screen.getByText('No due date'));
    fireEvent.click(screen.getByText('15'));

    fireEvent.click(screen.getByText('Select a project'));
    fireEvent.click(screen.getByText('Test Project'));

    fireEvent.click(screen.getByText('Select priority'));
    fireEvent.click(screen.getByText('High'));

    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(mockOnCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          projectId: 'project1',
        })
      );
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('toggles task status when clicking the status button', () => {
    renderComponent();

    const statusButton = screen.getByText('Mark complete');
    fireEvent.click(statusButton);

    expect(screen.getByText('Completed')).toBeInTheDocument();

    fireEvent.click(statusButton);

    expect(screen.getByText('Mark complete')).toBeInTheDocument();
  });
});
