import { Task, TaskStatus, TaskPriority } from '@/types/task';

type CreateTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  userId: string;
  projectId?: string | null;
};

export async function fetchTasks(userId: string): Promise<Task[]> {
  const response = await fetch(`/api/tasks?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
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
      dueDate: task.dueDate,
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
