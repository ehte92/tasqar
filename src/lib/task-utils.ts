import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import {
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  format,
} from 'date-fns';

export function getStatusStyles(task: Task): string {
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

export function getStatusInfo(task: Task) {
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
}

export function getPriorityInfo(priority: TaskPriority) {
  switch (priority) {
    case TaskPriority.HIGH:
      return { color: 'text-red-500', label: 'High' };
    case TaskPriority.MEDIUM:
      return { color: 'text-yellow-500', label: 'Medium' };
    case TaskPriority.LOW:
      return { color: 'text-green-500', label: 'Low' };
    default:
      return { color: 'text-gray-400', label: 'None' };
  }
}

export function formatDueDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  const diffDays = Math.abs(
    Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );
  if (diffDays < 7) return format(date, 'EEEE');
  return format(date, 'MMM d');
}
