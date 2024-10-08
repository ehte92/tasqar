import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { GripVertical, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskDialog } from './task-dialog';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
}

export function TaskCard({ task, onUpdateTask }: TaskCardProps) {
  const [localDueDate, setLocalDueDate] = React.useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
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

  const handleDateChange = (newDate: Date | undefined) => {
    setLocalDueDate(newDate);
    onUpdateTask({ ...task, dueDate: newDate || null });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 p-2 rounded shadow mb-2 flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical size={16} className="text-gray-400" />
      </div>
      <TaskDialog task={task} onUpdateTask={onUpdateTask}>
        <div className="flex-grow cursor-pointer truncate">{task.title}</div>
      </TaskDialog>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'p-0 h-6 w-6',
              isOverdue(localDueDate) ? 'text-red-500' : 'text-blue-500'
            )}
          >
            <CalendarIcon size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={localDueDate}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function isOverdue(date: Date | undefined): boolean {
  if (!date) return false;
  return date < new Date();
}
