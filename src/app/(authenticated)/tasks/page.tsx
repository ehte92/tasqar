'use client';

import { ContentLayout } from '@/components/layouts/content-layout';
import { columns } from '@/components/tasks/columns';
import { DataTable } from '@/components/tasks/data-table';
import { TaskTableSkeleton } from '@/components/tasks/task-table-skeleton';
import { useBackgroundSync } from '@/hooks/use-background-sync';
import { useTasks } from '@/services/task-service';
import { useSession } from 'next-auth/react';
import { Suspense } from 'react';

export default function TasksPage() {
  const { data: session } = useSession();
  const {
    data: tasks,
    isLoading,
    refetch,
  } = useTasks(session?.user?.id as string);

  useBackgroundSync(['tasks', session?.user?.id as string], 1 * 60 * 1000);

  return (
    <ContentLayout title="My tasks">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My tasks</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded flex items-center">
          <span className="mr-2">+</span> Add task
        </button>
      </div>
      <Suspense fallback={<TaskTableSkeleton />}>
        <DataTable
          columns={columns}
          data={tasks || []}
          refetch={refetch}
          isLoading={isLoading}
        />
      </Suspense>
    </ContentLayout>
  );
}
