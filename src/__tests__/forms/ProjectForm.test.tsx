import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { ProjectForm } from '@/components/projects/project-form';
import { createProject, updateProject } from '@/services/project-service';
import { ProjectStatus } from '@/types/project';

// Mock the dependencies
jest.mock('@/services/project-service', () => ({
  createProject: jest.fn(),
  updateProject: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ProjectForm', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with correct fields', () => {
    render(<ProjectForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Project' })
    ).toBeInTheDocument();
  });

  it('submits the form with valid data for new project', async () => {
    render(<ProjectForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Project' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Project Description' },
    });
    fireEvent.click(screen.getByLabelText('Status'));
    fireEvent.click(screen.getByText(ProjectStatus.PLANNED));

    fireEvent.click(screen.getByRole('button', { name: 'Create Project' }));

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        title: 'New Project',
        description: 'Project Description',
        status: ProjectStatus.PLANNED,
        userId: 'current-user-id',
      });
      expect(toast.success).toHaveBeenCalledWith(
        'Project created successfully'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('updates an existing project', async () => {
    const initialData = {
      title: 'Existing Project',
      description: 'Old Description',
      status: ProjectStatus.PLANNED,
    };

    render(
      <ProjectForm
        projectId="123"
        initialData={initialData}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Updated Project' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Updated Description' },
    });
    fireEvent.click(screen.getByLabelText('Status'));
    fireEvent.click(screen.getByText(ProjectStatus.COMPLETED));

    fireEvent.click(screen.getByRole('button', { name: 'Update Project' }));

    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith('123', {
        title: 'Updated Project',
        description: 'Updated Description',
        status: ProjectStatus.COMPLETED,
      });
      expect(toast.success).toHaveBeenCalledWith(
        'Project updated successfully'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays validation errors for invalid inputs', async () => {
    render(<ProjectForm onSuccess={mockOnSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Project' }));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('handles submission error', async () => {
    (createProject as jest.Mock).mockRejectedValue(
      new Error('Submission failed')
    );

    render(<ProjectForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Project' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Project' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to submit project');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
