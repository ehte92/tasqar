import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, ArrowRight, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  const handleSubmit = () => {
    if (title.trim()) {
      onCreateTask({
        title,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: dueDate ?? null,
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate(undefined);
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      resetForm();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isExpanded ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          key="collapsed"
          className="mb-2"
        >
          <Button
            onClick={() => setIsExpanded(true)}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add new task
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          key="expanded"
          className="space-y-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border border-input shadow-sm mb-2"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className="relative flex-grow"
              initial={{ width: '100%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.2 }}
            >
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What needs to be done?"
                className="pr-10"
              />
            </motion.div>
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      'w-10 h-10 p-0 transition-colors duration-200',
                      dueDate &&
                        'text-primary border-primary hover:bg-primary/10'
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
            </motion.div>
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="default"
                size="icon"
                onClick={handleSubmit}
                className="w-10 h-10"
                disabled={!title.trim()}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          <AnimatePresence>
            {dueDate && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-muted-foreground flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Due: {format(dueDate, 'PPP')}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="flex justify-between items-center text-sm"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200"
              onClick={() => setIsDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200"
              onClick={resetForm}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}
      <CreateTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateTask={(taskDetails) => {
          onCreateTask({ ...taskDetails, title, dueDate });
          resetForm();
        }}
        initialData={{ title, dueDate }}
      />
    </AnimatePresence>
  );
}
