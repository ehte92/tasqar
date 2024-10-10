'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { TaskDialog } from './task-dialog';
import { LoadingSpinner } from '../ui/loading-spinner';

export interface TaskDragData {
  type: 'Task';
  task: Task;
}

interface TaskCardInteractiveProps {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  children: React.ReactNode;
}

export function TaskCardInteractive({
  task,
  onUpdateTask,
  onDeleteTask,
  children,
}: TaskCardInteractiveProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    } as TaskDragData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTaskUpdate = useCallback(
    (updatedTask: Task) => {
      onUpdateTask(updatedTask);
      setIsDialogOpen(false);
    },
    [onUpdateTask]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsDialogOpen(true);
    }
  }, []);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ y: -2, scale: 1.02 }}
      className={isDragging ? 'opacity-50 scale-105' : 'opacity-100'}
    >
      <div className="flex items-start space-x-3">
        <motion.div
          className="cursor-grab hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} className="text-gray-400" />
        </motion.div>
        <div
          className="flex-grow cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`Open task details for ${task.title}`}
        >
          {children}
        </div>
      </div>
      {isDialogOpen && (
        <Suspense fallback={<LoadingSpinner />}>
          <TaskDialog
            task={task}
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onUpdateTask={handleTaskUpdate}
            onDeleteTask={onDeleteTask}
          />
        </Suspense>
      )}
    </motion.div>
  );
}
