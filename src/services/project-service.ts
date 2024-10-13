import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import { Project, ProjectStatus } from '@/types/project';

const PROJECTS_CACHE_KEY = 'projects_cache';
const PROJECTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchProjects(userId: string): Promise<Project[]> {
  const response = await fetch(`/api/projects?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

export function useProjects(userId: string) {
  return useOptimizedQuery<Project[]>(
    ['projects', userId],
    () => fetchProjects(userId),
    { key: PROJECTS_CACHE_KEY, ttl: PROJECTS_CACHE_TTL },
    {
      enabled: !!userId,
    }
  );
}

export async function createProject(project: {
  title: string;
  description?: string;
  userId: string;
}): Promise<Project> {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...project,
        status: ProjectStatus.PLANNED, // Set a default status
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create project');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project. Please try again.');
  }
}

export async function updateProject(
  projectId: string,
  data: { title: string; description?: string; endDate?: string | null }
): Promise<Project> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update project');
  }

  return response.json();
}

export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete project');
  }
}

export async function reorderProjects(data: {
  userId: string;
  projectIds: string[];
}): Promise<void> {
  const response = await fetch('/api/projects/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to reorder projects');
  }
}

export const fetchProjectById = async (projectId: string): Promise<Project> => {
  const response = await fetch(`/api/projects/${projectId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Project not found');
    }
    throw new Error('Failed to fetch project');
  }
  return response.json();
};

export function useFetchProjectById(projectId: string) {
  return useOptimizedQuery<Project>(
    ['project', projectId],
    () => fetchProjectById(projectId),
    {
      key: `project-${projectId}`,
      ttl: 5 * 60 * 1000, // 5 minutes
    },
    {
      enabled: !!projectId,
    }
  );
}
