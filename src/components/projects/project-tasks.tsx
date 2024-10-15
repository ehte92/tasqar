'use client';

import React, { useCallback, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useFetchProjectById } from '@/services/project-service';
import { createTask } from '@/services/task-service';
import { Task } from '@/types/task';

import { CreateTaskDialog } from '../dashboard/create-task-dialog';
import { useColumns } from '../tasks/columns';
import { DataTable } from '../tasks/data-table';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface ProjectTasksProps {
  projectId: string;
}

export const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId }) => {
  const { t } = useTranslation(['project', 'common']);
  const columns = useColumns();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data: project, isLoading, error } = useFetchProjectById(projectId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(
        ['tasks', session?.user?.id],
        (oldTasks = []) => [...oldTasks, newTask]
      );
      toast.success(t('common:taskCreatedSuccess'));
    },
    onError: (error) => {
      toast.error(t('common:taskCreatedError'));
      console.error('Error creating task:', error);
    },
  });

  const handleCreateTask = useCallback(
    (newTask: Partial<Task>) => {
      if (session?.user?.id) {
        createTaskMutation.mutate({
          ...newTask,
          userId: session.user.id,
          projectId: projectId,
        });
      }
    },
    [createTaskMutation, session?.user?.id, projectId]
  );

  const handleCreateTaskFromDialog = useCallback(
    (taskDetails: Partial<Task>) => {
      handleCreateTask(taskDetails);
      setIsDialogOpen(false);
    },
    [handleCreateTask]
  );

  if (isLoading) {
    return <ProjectTasksSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('project:tasks')}
          </CardTitle>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto hidden h-8 lg:flex"
              disabled={isLoading}
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              {t('project:addTask')}
            </Button>
          </motion.div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={project?.tasks || []}
            refetch={() => {}}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      <AnimatePresence>
        {isDialogOpen && (
          <CreateTaskDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onCreateTask={handleCreateTaskFromDialog}
            initialData={{ projectId: projectId }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ProjectTasksSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-1/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-10 w-full mb-4" />
    </CardContent>
  </Card>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  const { t } = useTranslation('common');

  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="flex items-center justify-center p-6">
        <span className="text-red-700">
          {t('error')}: {message}
        </span>
      </CardContent>
    </Card>
  );
};
