import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { useTasks } from '@/services/task-service';
import { Task } from '@/types/task';

function searchTasks(tasks: Task[], query: string): Task[] {
  const lowercaseQuery = query.toLowerCase();
  return tasks.filter((task) =>
    task.title.toLowerCase().includes(lowercaseQuery)
  );
}

export function useTaskSearch(query: string) {
  const { data: session } = useSession();
  const { data: allTasks, isLoading: isTaskListLoading } = useTasks(
    session?.user?.id || ''
  );

  return useQuery({
    queryKey: ['tasks', 'search', query],
    queryFn: () => searchTasks(allTasks || [], query),
    enabled: !!session?.user?.id && query.length > 0 && !isTaskListLoading,
  });
}
