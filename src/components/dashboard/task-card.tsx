import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import {
  GripVertical,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Flag,
} from 'lucide-react';
import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  differenceInDays,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskDialog } from './task-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskCard({ task, onUpdateTask, onDeleteTask }: TaskCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    onUpdateTask(updatedTask);
    setIsDialogOpen(false);
  };

  const getStatusStyles = () => {
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
  };

  const getStatusInfo = () => {
    if (task.status === TaskStatus.DONE) {
      return { icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
    }
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (isPast(dueDate) && !isToday(dueDate)) {
        return { icon: AlertCircle, color: 'text-red-500', label: 'Overdue' };
      }
      if (isToday(dueDate)) {
        return { icon: Clock, color: 'text-yellow-500', label: 'Due Today' };
      }
      if (isFuture(dueDate)) {
        return { icon: Calendar, color: 'text-blue-500', label: 'Upcoming' };
      }
    }
    return { icon: Clock, color: 'text-gray-400', label: 'No Due Date' };
  };

  const getPriorityInfo = () => {
    switch (task.priority) {
      case TaskPriority.HIGH:
        return { color: 'text-red-500', label: 'High' };
      case TaskPriority.MEDIUM:
        return { color: 'text-yellow-500', label: 'Medium' };
      case TaskPriority.LOW:
        return { color: 'text-green-500', label: 'Low' };
      default:
        return { color: 'text-gray-400', label: 'None' };
    }
  };

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    const diffDays = differenceInDays(date, new Date());
    if (diffDays > -7 && diffDays < 7) return format(date, 'EEEE');
    return format(date, 'MMM d');
  };

  const statusInfo = getStatusInfo();
  const priorityInfo = getPriorityInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-4 rounded-lg shadow-sm border transition-all duration-200',
        getStatusStyles(),
        'hover:shadow-md',
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
                    'font-medium line-clamp-2 text-sm mb-1',
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
            <span>{priorityInfo.label} Priority</span>
          </div>
          {task.dueDate && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDueDate(new Date(task.dueDate))}</span>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            <Progress
              value={task.status === TaskStatus.DONE ? 100 : 0}
              className="h-1"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <TaskDialog
        task={task}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUpdateTask={handleTaskUpdate}
        onDeleteTask={onDeleteTask}
      />
    </motion.div>
  );
}
