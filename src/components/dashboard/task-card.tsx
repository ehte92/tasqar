import React, { forwardRef, useMemo, useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  differenceInDays,
  format,
  isFuture,
  isPast,
  isToday,
  isTomorrow,
  isYesterday,
} from 'date-fns';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Flag,
  GripVertical,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Task, TaskPriority, TaskStatus } from '@/types/task';

import { LoadingSpinner } from '../ui/loading-spinner';

const TaskDialog = dynamic(
  () => import('./task-dialog').then((mod) => mod.TaskDialog),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
);

export interface TaskCardProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onUpdateTask, onDeleteTask }, ref) => {
    const { t } = useTranslation('task');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id, data: { type: 'Task', task } });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleTaskUpdate = (updatedTask: Task) => {
      onUpdateTask(updatedTask);
      setIsDialogOpen(false);
    };

    const { statusStyles, statusInfo, priorityInfo } = useMemo(
      () => ({
        statusStyles: getStatusStyles(task),
        statusInfo: getStatusInfo(task, t),
        priorityInfo: getPriorityInfo(task.priority, t),
      }),
      [task, t]
    );

    const StatusIcon = statusInfo.icon;

    return (
      <motion.div
        ref={ref}
        style={style}
        className={cn(
          'p-4 rounded-lg shadow-sm border transition-all duration-200',
          statusStyles,
          'hover:shadow-md group',
          isDragging ? 'opacity-50 scale-105' : 'opacity-100'
        )}
        whileHover={{ y: -2, scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
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
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    className={cn(
                      'font-medium line-clamp-2 text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors',
                      task.status === TaskStatus.DONE &&
                        'line-through text-gray-500'
                    )}
                  >
                    {task.title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{task.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <StatusIcon size={14} className={statusInfo.color} />
              <span>{statusInfo.label}</span>
              <span>•</span>
              <Flag size={14} className={priorityInfo.color} />
              <span>{priorityInfo.label}</span>
            </div>
            {task.dueDate && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 flex items-center space-x-1">
                <Calendar size={14} />
                <span>{formatDueDate(new Date(task.dueDate), t)}</span>
              </div>
            )}
          </div>
        </div>
        {isDialogOpen && (
          <TaskDialog
            task={task}
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onUpdateTask={handleTaskUpdate}
            onDeleteTask={onDeleteTask}
          />
        )}
      </motion.div>
    );
  }
);

TaskCard.displayName = 'TaskCard';

// Helper functions moved outside the component for better performance
function getStatusStyles(task: Task) {
  if (task.status === TaskStatus.DONE) {
    return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
  }
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) {
      return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
    }
    if (isToday(dueDate)) {
      return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    }
    if (isFuture(dueDate)) {
      return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    }
  }
  return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
}

function getStatusInfo(task: Task, t: (key: string) => string) {
  if (task.status === TaskStatus.DONE) {
    return {
      icon: CheckCircle,
      color: 'text-green-500',
      label: t('taskStatus.completed'),
    };
  }
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        label: t('taskStatus.overdue'),
      };
    }
    if (isToday(dueDate)) {
      return {
        icon: Clock,
        color: 'text-yellow-500',
        label: t('today'),
      };
    }
    if (isFuture(dueDate)) {
      return {
        icon: Calendar,
        color: 'text-blue-500',
        label: t('taskStatus.upcoming'),
      };
    }
  }
  return { icon: Clock, color: 'text-gray-400', label: t('noDueDate') };
}

function getPriorityInfo(priority: TaskPriority, t: (key: string) => string) {
  switch (priority) {
    case TaskPriority.HIGH:
      return { color: 'text-red-500', label: t('priority.high') };
    case TaskPriority.MEDIUM:
      return { color: 'text-yellow-500', label: t('priority.medium') };
    case TaskPriority.LOW:
      return { color: 'text-green-500', label: t('priority.low') };
    default:
      return { color: 'text-gray-400', label: t('priority.none') };
  }
}

function formatDueDate(date: Date, t: (key: string) => string) {
  if (isToday(date)) return t('today');
  if (isTomorrow(date)) return t('tomorrow');
  if (isYesterday(date)) return t('yesterday');
  const diffDays = differenceInDays(date, new Date());
  if (diffDays > -7 && diffDays < 7) return format(date, 'EEEE');
  return format(date, 'MMM d');
}
