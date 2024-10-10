import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { Calendar, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TaskCardInteractive } from './task-card-interactive';
import {
  getStatusStyles,
  getStatusInfo,
  getPriorityInfo,
  formatDueDate,
} from '@/lib/task-utils';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskCard({ task, onUpdateTask, onDeleteTask }: TaskCardProps) {
  const statusInfo = getStatusInfo(task);
  const priorityInfo = getPriorityInfo(task.priority);
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={cn(
        'p-4 rounded-lg shadow-sm border transition-all duration-200',
        getStatusStyles(task),
        'hover:shadow-md',
        'mb-3'
      )}
    >
      <div className="flex items-start space-x-3">
        <TaskCardInteractive
          task={task}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
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
        </TaskCardInteractive>
      </div>
    </div>
  );
}
