import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, ChevronRight, X, MoreHorizontal } from 'lucide-react';
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
import { format } from 'date-fns';

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
        priority: TaskPriority.MEDIUM,
        dueDate: dueDate ?? null,
      });
      resetForm();
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate(undefined);
    setIsCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      resetForm();
    }
  };

  if (!isCreating) {
    return (
      <Button
        onClick={handleCreate}
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add new task
      </Button>
    );
  }

  return (
    <div className="space-y-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border border-input shadow-sm transition-all duration-300 animate-in fade-in-50">
      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="pr-10"
          />
          {title && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setTitle('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'w-10 h-10 p-0 transition-colors duration-200',
                dueDate && 'text-primary border-primary hover:bg-primary/10'
              )}
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
        <Button
          variant="default"
          size="icon"
          onClick={handleSubmit}
          className="w-10 h-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {dueDate && (
        <p className="text-sm text-muted-foreground flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Due: {format(dueDate, 'PPP')}
        </p>
      )}
      <div className="flex justify-between items-center text-sm">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200"
          onClick={() => setIsDialogOpen(true)}
        >
          <MoreHorizontal className="h-4 w-4 mr-2" />
          Add more details
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200"
          onClick={resetForm}
        >
          Cancel
        </Button>
      </div>
      <CreateTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateTask={(taskDetails) => {
          onCreateTask({ ...taskDetails, title, dueDate });
          resetForm();
        }}
        initialData={{ title, dueDate }}
      />
    </div>
  );
}
