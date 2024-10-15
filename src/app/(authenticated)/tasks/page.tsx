'use client';

import { Suspense, useCallback, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { CreateTaskDialog } from '@/components/dashboard/create-task-dialog';
import { ContentLayout } from '@/components/layouts/content-layout';
import { useColumns } from '@/components/tasks/columns';
import { DataTable } from '@/components/tasks/data-table';
import { TaskTableSkeleton } from '@/components/tasks/task-table-skeleton';
import { Button } from '@/components/ui/button';
import { useBackgroundSync } from '@/hooks/use-background-sync';
import { createTask, useTasks } from '@/services/task-service';
import { Task } from '@/types/task';

export default function TasksPage() {
  const { t } = useTranslation('task');
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const columns = useColumns();
  const {
    data: tasks,
    isLoading,
    refetch,
  } = useTasks(session?.user?.id as string);

  useBackgroundSync(['tasks', session?.user?.id as string], 1 * 60 * 1000);

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(
        ['tasks', session?.user?.id],
        (oldTasks = []) => [...oldTasks, newTask]
      );
      toast.success(t('taskCreatedSuccess'));
    },
    onError: (error) => {
      toast.error(t('taskCreatedError'));
      console.error('Error creating task:', error);
    },
  });

  const handleCreateTask = useCallback(
    (newTask: Partial<Task>) => {
      if (session?.user?.id) {
        createTaskMutation.mutate({
          ...newTask,
          userId: session.user.id,
        });
      }
    },
    [createTaskMutation, session?.user?.id]
  );

  const handleCreateTaskFromDialog = useCallback(
    (taskDetails: Partial<Task>) => {
      handleCreateTask(taskDetails);
      setIsDialogOpen(false);
    },
    [handleCreateTask]
  );

  return (
    <ContentLayout title={t('myTasks')}>
      <div className="flex justify-end items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
          disabled={isLoading}
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          {t('addTask')}
        </Button>
      </div>
      <Suspense fallback={<TaskTableSkeleton />}>
        <DataTable
          columns={columns}
          data={tasks || []}
          refetch={refetch}
          isLoading={isLoading}
        />
      </Suspense>
      {isDialogOpen && (
        <CreateTaskDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onCreateTask={handleCreateTaskFromDialog}
        />
      )}
    </ContentLayout>
  );
}
