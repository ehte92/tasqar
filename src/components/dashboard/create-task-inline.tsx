import React, { useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CreateTaskDialog } from './create-task-dialog';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

interface CreateTaskInlineProps {
  onCreateTask: (task: Partial<Task>) => void;
}

export function CreateTaskInline({ onCreateTask }: CreateTaskInlineProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onCreateTask({
        title,
        status: isCompleted ? TaskStatus.DONE : TaskStatus.TODO,
        dueDate: dueDate ?? null,
        priority: TaskPriority.MEDIUM, // Default priority
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setIsCompleted(false);
    setDueDate(undefined);
    setIsCreating(false);
  };

  if (!isCreating) {
    return (
      <Button
        onClick={handleCreate}
        variant="ghost"
        className="w-full justify-start"
      >
        + Add new task
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) => setIsCompleted(checked as boolean)}
      />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title"
        className="flex-grow"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(dueDate && 'text-blue-500')}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarComponent
            mode="single"
            selected={dueDate}
            onSelect={setDueDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <CreateTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateTask={(taskDetails) => {
          onCreateTask({
            ...taskDetails,
            title,
            status: isCompleted ? TaskStatus.DONE : TaskStatus.TODO,
            dueDate,
          });
          resetForm();
        }}
        initialData={{
          title,
          status: isCompleted ? TaskStatus.DONE : TaskStatus.TODO,
          dueDate,
        }}
      />
      <Button onClick={handleSubmit}>Create</Button>
    </div>
  );
}
