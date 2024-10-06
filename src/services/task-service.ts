import { Task, TaskStatus, TaskPriority } from '@/types/task';

export async function fetchTasks(userId: string): Promise<Task[]> {
  const response = await fetch(`/api/tasks?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function createTask(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
}

export async function updateTask(task: Task): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
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
