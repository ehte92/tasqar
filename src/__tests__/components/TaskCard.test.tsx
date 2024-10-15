import React from 'react';

import { render, screen } from '@testing-library/react';

import { TaskCard } from '@/components/dashboard/task-card';
import { Task, TaskPriority, TaskStatus } from '@/types/task';

// Mock the Framer Motion component
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<any>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<{}>) => (
    <>{children}</>
  ),
}));

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date('2023-05-01'),
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-04-01'),
    projectId: 'project1',
    description: 'This is a test task',
    userId: 'user1',
    columnId: 'column1',
    content: 'Task content',
  };

  const mockOnUpdateTask = jest.fn();
  const mockOnDeleteTask = jest.fn();

  it('renders the task card with correct information', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority')).toBeInTheDocument();
    expect(screen.getByText('May 1')).toBeInTheDocument();
  });

  it('does not render the description directly', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.queryByText('This is a test task')).not.toBeInTheDocument();
  });

  it('renders the correct status', () => {
    const currentDate = new Date('2023-04-15'); // Set a fixed date for testing
    jest.useFakeTimers().setSystemTime(currentDate);

    render(
      <TaskCard
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('Todo')).toBeInTheDocument();

    jest.useRealTimers(); // Reset timers after the test
  });

  it('renders overdue status when task is past due date', () => {
    const currentDate = new Date('2023-05-02'); // Set a date after the due date
    jest.useFakeTimers().setSystemTime(currentDate);

    render(
      <TaskCard
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('Overdue')).toBeInTheDocument();

    jest.useRealTimers(); // Reset timers after the test
  });

  // Add more tests as needed
});
