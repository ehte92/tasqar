import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Add this import
import { ProjectCard } from '@/components/projects/project-card';
import { Project } from '@/types/project';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { ProjectStatus } from '@/types/project'; // Implied import for ProjectStatus enum

describe('ProjectCard', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: '1',
      description: 'Task 1 description',
      userId: 'user1',
      columnId: 'column1',
      content: 'Task 1 content',
    },
    {
      id: '2',
      title: 'Task 2',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: '1',
      description: 'Task 2 description',
      userId: 'user1',
      columnId: 'column2',
      content: 'Task 2 content',
    },
  ];

  const mockProject: Project = {
    id: '1',
    title: 'Test Project',
    description: 'This is a test project description',
    tasks: mockTasks,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ProjectStatus.ACTIVE,
    userId: 'user1',
  };

  it('renders project details correctly', () => {
    render(<ProjectCard project={mockProject} />);

    const card = screen.getByTestId('project-card');
    expect(card).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test project description')
    ).toBeInTheDocument();
    expect(screen.getByText('Tasks: 2')).toBeInTheDocument();
  });

  it('renders correctly with no tasks', () => {
    const projectWithNoTasks: Project = { ...mockProject, tasks: [] };
    render(<ProjectCard project={projectWithNoTasks} />);

    expect(screen.getByTestId('project-card')).toBeInTheDocument();
    expect(screen.getByText('Tasks: 0')).toBeInTheDocument();
  });

  it('applies hover styles', () => {
    render(<ProjectCard project={mockProject} />);

    const card = screen.getByTestId('project-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('hover:shadow-lg');
    expect(card).toHaveClass('transition-shadow');
  });
});
