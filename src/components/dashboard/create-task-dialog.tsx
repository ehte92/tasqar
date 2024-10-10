import React from 'react';
import { Task } from '@/types/task';
import { TaskFormDialog } from './task-form-dialog';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Partial<Task>) => void;
  initialData: Partial<Task>;
}

export function CreateTaskDialog({
  isOpen,
  onClose,
  onCreateTask,
  initialData,
}: CreateTaskDialogProps) {
  return (
    <TaskFormDialog
      task={initialData}
      isOpen={isOpen}
      onClose={onClose}
      onSaveTask={onCreateTask}
      mode="create"
    />
  );
}
