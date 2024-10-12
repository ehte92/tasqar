import React, { useState, useRef, useEffect } from 'react';
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
import { Task, TaskStatus } from '@/types/task';
import { cn } from '@/lib/utils';

interface CreateTaskInlineProps {
  onCreateTask: (task: Partial<Task>) => void;
}

export function CreateTaskInline({ onCreateTask }: CreateTaskInlineProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onCreateTask({
        title,
        status: TaskStatus.TODO,
        dueDate: dueDate ?? null,
      });
      resetForm();
      setIsCreating(true); // Open a new inline task creation
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate(undefined);
  };

  const handleBlur = () => {
    if (!title.trim()) {
      setIsCreating(false);
    } else {
      handleSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isCreating) {
    return (
      <Button
        onClick={handleCreate}
        variant="ghost"
        className="w-full justify-start"
      >
        + Create task
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow">
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Write a task name"
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
          onCreateTask({ ...taskDetails, title, dueDate });
          resetForm();
          setIsCreating(false);
        }}
        initialData={{ title, dueDate }}
      />
    </div>
  );
}
