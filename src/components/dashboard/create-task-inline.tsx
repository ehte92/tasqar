import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Calendar, ChevronRight, Plus } from 'lucide-react';
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
import { AnimatePresence, motion } from 'framer-motion';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useSession } from 'next-auth/react';

interface CreateTaskInlineProps {
  onCreateTask: (task: Partial<Task>) => void;
}

export function CreateTaskInline({ onCreateTask }: CreateTaskInlineProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  useClickOutside(containerRef, () => {
    if (isCreating && !title.trim()) {
      resetForm();
    }
  });

  const resetForm = useCallback(() => {
    setTitle('');
    setDueDate(undefined);
    setIsCreating(false);
  }, []);

  const handleCreate = useCallback(() => {
    setIsCreating(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleSubmit = useCallback(() => {
    if (title.trim()) {
      onCreateTask({
        title,
        status: TaskStatus.TODO,
        dueDate: dueDate ?? null,
        assigneeId: session?.user?.id ?? '',
      });
      resetForm();
      setIsCreating(true); // Open a new inline task creation
    } else {
      resetForm();
    }
  }, [title, dueDate, onCreateTask, resetForm, session?.user?.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        resetForm();
      }
    },
    [handleSubmit, resetForm]
  );

  const calendarTrigger = useMemo(
    () => (
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'transition-colors duration-200',
            dueDate && 'text-blue-500 border-blue-500'
          )}
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
    ),
    [dueDate]
  );

  const calendarContent = useMemo(
    () => (
      <PopoverContent className="w-auto p-0" align="end">
        <CalendarComponent
          mode="single"
          selected={dueDate}
          onSelect={setDueDate}
          initialFocus
        />
      </PopoverContent>
    ),
    [dueDate]
  );

  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleCreateTaskFromDialog = useCallback(
    (taskDetails: Partial<Task>) => {
      onCreateTask(taskDetails);
      resetForm();
      setIsDialogOpen(false);
    },
    [onCreateTask, resetForm]
  );

  return (
    <AnimatePresence mode="wait">
      {!isCreating ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={handleCreate}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create task
          </Button>
        </motion.div>
      ) : (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-2 bg-card p-2 rounded-md shadow-sm"
        >
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a task name"
            className="flex-grow"
          />
          <Popover>
            {calendarTrigger}
            {calendarContent}
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenDialog}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {isDialogOpen && (
            <CreateTaskDialog
              key={title}
              isOpen={isDialogOpen}
              onClose={handleCloseDialog}
              onCreateTask={handleCreateTaskFromDialog}
              initialData={{ title, dueDate: dueDate ?? null }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
