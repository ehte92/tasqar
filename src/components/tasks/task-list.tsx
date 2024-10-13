'use client';

import { useTasks } from '@/services/task-service';
import { useSession } from 'next-auth/react';
import { TaskCard } from './task-card';

export function TaskList() {
  const { data: session } = useSession();
  const {
    data: tasks,
    error,
    isLoading,
  } = useTasks(session?.user.id as string);

  if (isLoading) return null; // Skeleton is handled by Suspense

  if (error) return <div>Error loading tasks: {error.message}</div>;

  if (!tasks || tasks.length === 0) {
    return <div>You haven&apos;t created any tasks yet.</div>;
  }

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  );
}
