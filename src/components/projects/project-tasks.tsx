'use client';

import React, { useCallback, useState } from 'react';
import { useFetchProjectById } from '@/services/project-service';
import { DataTable } from '../tasks/data-table';
import { columns } from '../tasks/columns';
import { Button } from '../ui/button';
import { PlusIcon } from 'lucide-react';
import { CreateTaskDialog } from '../dashboard/create-task-dialog';
import { Task } from '@/types/task';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { createTask } from '@/services/task-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProjectTasksProps {
  projectId: string;
}

export const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId }) => {
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
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create task');
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
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error loading tasks: {error.message}</div>;
  }

  return (
    <>
      <div className="flex justify-end items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
          disabled={isLoading}
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add task
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={project?.tasks || []}
        refetch={() => {}}
        isLoading={isLoading}
      />
      {isDialogOpen && (
        <CreateTaskDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onCreateTask={handleCreateTaskFromDialog}
          initialData={{ projectId: projectId }}
        />
      )}
    </>
  );
};
