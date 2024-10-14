'use client';

import { useState } from 'react';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Task } from '@/types/task';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTask, updateTask } from '@/services/task-service';
import { useSession } from 'next-auth/react';
import { EditTaskDialog } from './edit-task-dialog';
import { toast } from 'sonner';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const task = row.original as Task;
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({
        queryKey: ['tasks', session?.user?.id],
      });
      const previousTasks = queryClient.getQueryData([
        'tasks',
        session?.user?.id,
      ]);
      queryClient.setQueryData(
        ['tasks', session?.user?.id],
        (old: Task[] | undefined) =>
          old
            ? old.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
              )
            : []
      );
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData(
        ['tasks', session?.user?.id],
        context?.previousTasks
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
    },
  });

  const handleTaskUpdate = (updatedTask: Task) => {
    updateTaskMutation.mutate(updatedTask);
    setIsEditDialogOpen(false);
  };

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({
        queryKey: ['tasks', session?.user?.id],
      });
      const previousTasks = queryClient.getQueryData([
        'tasks',
        session?.user?.id,
      ]);
      queryClient.setQueryData(
        ['tasks', session?.user?.id],
        (old: Task[] | undefined) =>
          old ? old.filter((task) => task.id !== taskId) : []
      );
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      queryClient.setQueryData(
        ['tasks', session?.user?.id],
        context?.previousTasks
      );
      toast.error('Failed to delete task');
    },
    onSuccess: () => {
      toast.success('Task deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
    },
  });

  const handleDeleteTask = (taskId: string) => {
    setIsDeleteDialogOpen(false);
    deleteTaskMutation.mutate(taskId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isEditDialogOpen && (
        <EditTaskDialog
          task={task}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onUpdateTask={handleTaskUpdate}
          onDeleteTask={() => setIsDeleteDialogOpen(true)}
        />
      )}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
