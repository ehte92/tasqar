import { useQuery } from '@tanstack/react-query';

import { Task, TaskPriority, TaskStatus } from '@/types/task';

type CreateTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  userId: string;
  projectId?: string | null;
  assigneeId?: string | null;
};

export async function fetchTasks(userId: string): Promise<Task[]> {
  const response = await fetch(
    `/api/tasks?userId=${userId}&assigneeId=${userId}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export function useTasks(userId: string) {
  return useQuery<Task[]>({
    queryKey: ['tasks', userId],
    queryFn: () => fetchTasks(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

const fetchTaskStats = async (userId: string) => {
  const response = await fetch(`/api/tasks/stats?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task stats');
  }
  return response.json();
};

export function useTaskStats(userId: string) {
  return useQuery<any>({
    queryKey: ['task_stats', userId],
    queryFn: () => fetchTaskStats(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...task,
      status: task.status ? TaskStatus[task.status] : undefined,
      assigneeId: task.assigneeId || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create task');
  }

  return response.json();
}

export async function updateTask(task: Task): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...task,
      status: TaskStatus[task.status],
      dueDate: task.dueDate,
      assigneeId: task.assigneeId || null,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
}

export async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks?id=${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
}

export async function reorderTasks(data: {
  userId: string;
  taskIds: string[];
}): Promise<void> {
  const response = await fetch('/api/tasks/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to reorder tasks');
  }
}
