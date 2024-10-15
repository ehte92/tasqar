import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { TaskPriority, TaskStatus } from '@/types/task';

// Mock the necessary modules
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: () => ({
    data: { user: { id: 'user1', name: 'Test User', image: null } },
    status: 'authenticated',
  }),
}));

jest.mock('@/services/project-service', () => ({
  useProjects: () => ({ data: [], isLoading: false }),
}));

jest.mock('@/services/connection-service', () => ({
  useConnections: () => ({ data: [], isLoading: false }),
}));

describe('EditTaskDialog', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date('2023-12-31'),
    projectId: null,
    assigneeId: null,
    // Add the missing properties
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
    columnId: 'column1',
    content: 'Test Content',
  };

  const mockOnClose = jest.fn();
  const mockOnUpdateTask = jest.fn();
  const mockOnDeleteTask = jest.fn();

  const renderComponent = () => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <EditTaskDialog
            task={mockTask}
            isOpen={true}
            onClose={mockOnClose}
            onUpdateTask={mockOnUpdateTask}
            onDeleteTask={mockOnDeleteTask}
          />
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  it('renders the dialog with task details', async () => {
    renderComponent();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority')).toBeInTheDocument();
    expect(screen.getByText('Dec 31')).toBeInTheDocument();
  });

  it('updates task title when input changes', async () => {
    renderComponent();

    const titleInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(titleInput, { target: { value: 'Updated Task Title' } });

    const updateButton = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockOnUpdateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Task Title',
        })
      );
    });
  });

  it('toggles task status when clicking the status button', async () => {
    renderComponent();

    const statusButton = screen.getByRole('button', { name: 'Mark complete' });
    fireEvent.click(statusButton);

    await waitFor(() => {
      expect(mockOnUpdateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TaskStatus.DONE,
        })
      );
    });
  });

  it('opens delete confirmation when delete button is clicked', async () => {
    renderComponent();

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    expect(
      screen.getByText('This task will be deleted permanently.')
    ).toBeInTheDocument();
  });

  it('calls onDeleteTask when delete is confirmed', async () => {
    renderComponent();

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockOnDeleteTask).toHaveBeenCalledWith('1');
    });
  });
});
