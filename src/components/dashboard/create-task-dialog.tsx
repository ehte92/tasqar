import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { CalendarIcon, X, Check, Flag } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isToday, isTomorrow, isThisYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { MinimalTiptapEditor } from '../minimal-tiptap';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '@/services/project-service';
import { Badge } from '@/components/ui/badge';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Partial<Task>) => void;
  initialData: Partial<Task>;
}

export function CreateTaskDialog({
  isOpen,
  onClose,
  onCreateTask,
  initialData,
}: CreateTaskDialogProps) {
  const [taskDetails, setTaskDetails] = useState<Partial<Task>>(initialData);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { data: session } = useSession();

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects', session?.user?.id],
    queryFn: () => fetchProjects(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

  // Add this useEffect hook to update taskDetails when initialData changes
  useEffect(() => {
    setTaskDetails(initialData);
  }, [initialData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTaskDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleDueDateChange = useCallback((date: Date | undefined) => {
    setTaskDetails((prev) => ({ ...prev, dueDate: date || null }));
    setIsCalendarOpen(false);
  }, []);

  const clearDueDate = useCallback(() => {
    setTaskDetails((prev) => ({ ...prev, dueDate: null }));
    setIsCalendarOpen(false);
  }, []);

  const handleProjectChange = useCallback((value: string) => {
    setTaskDetails((prev) => ({ ...prev, projectId: value }));
  }, []);

  const toggleTaskStatus = useCallback(() => {
    setTaskDetails((prev) => ({
      ...prev,
      status:
        prev.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE,
    }));
  }, []);

  const handlePriorityChange = useCallback((value: TaskPriority) => {
    setTaskDetails((prev) => ({ ...prev, priority: value }));
  }, []);

  const priorityOptions = useMemo(
    () => [
      {
        value: TaskPriority.LOW,
        label: 'Low',
        color: 'bg-blue-500',
        icon: '🔽',
      },
      {
        value: TaskPriority.MEDIUM,
        label: 'Medium',
        color: 'bg-yellow-500',
        icon: '➡️',
      },
      {
        value: TaskPriority.HIGH,
        label: 'High',
        color: 'bg-red-500',
        icon: '🔼',
      },
    ],
    []
  );

  const memoizedDueDateButton = useMemo(() => {
    const dueDate = taskDetails.dueDate ? new Date(taskDetails.dueDate) : null;

    const dateText = (() => {
      if (!dueDate) return 'No due date';
      if (isToday(dueDate)) return 'Today';
      if (isTomorrow(dueDate)) return 'Tomorrow';
      if (isThisYear(dueDate)) return format(dueDate, 'MMM dd');
      return format(dueDate, 'MMM dd, yyyy');
    })();

    return (
      <Button
        variant="ghost"
        className="w-[200px] justify-start text-left font-normal"
        onClick={() => setIsCalendarOpen(true)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {dateText}
      </Button>
    );
  }, [taskDetails.dueDate]);

  const handleSubmit = () => {
    onCreateTask(taskDetails);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]"
        hideCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>Create New Task</DialogTitle>
        </VisuallyHidden>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'text-sm transition-colors duration-200 py-1 px-2',
                taskDetails.status === TaskStatus.DONE
                  ? 'bg-green-900 text-green-200 hover:bg-green-700 border-green-500'
                  : 'bg-gray-800 text-white hover:bg-green-900 hover:text-green-200 border-gray-700 hover:border-green-900'
              )}
              onClick={toggleTaskStatus}
            >
              <Check className="mr-1 h-4 w-4" />
              {taskDetails.status === TaskStatus.DONE
                ? 'Completed'
                : 'Mark complete'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          <Input
            name="title"
            value={taskDetails.title || ''}
            onChange={handleChange}
            placeholder="Task name"
            className={cn(
              'text-2xl font-semibold px-0 focus-visible:ring-0',
              'border-transparent hover:border-input transition-colors duration-200',
              'rounded-md'
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="w-20 text-sm font-medium">Assignee</span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{session?.user?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-20 text-sm font-medium">Due date</span>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    {memoizedDueDateButton}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        taskDetails.dueDate
                          ? new Date(taskDetails.dueDate)
                          : undefined
                      }
                      onSelect={handleDueDateChange}
                      initialFocus
                    />
                    <div className="p-2 border-t">
                      <Button variant="ghost" size="sm" onClick={clearDueDate}>
                        Clear due date
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <AnimatePresence>
                  {taskDetails.dueDate && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearDueDate}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="w-20 text-sm font-medium">Project</span>
                <Select
                  value={taskDetails.projectId || ''}
                  onValueChange={handleProjectChange}
                >
                  <SelectTrigger className="w-full border-none hover:bg-accent">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {isProjectsLoading ? (
                      <SelectItem value="loading">
                        Loading projects...
                      </SelectItem>
                    ) : projects.length === 0 ? (
                      <SelectItem value="no_projects">
                        No projects found
                      </SelectItem>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-20 text-sm font-medium">Priority</span>
                <Select
                  value={taskDetails.priority || TaskPriority.MEDIUM}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger className="w-full border-none hover:bg-accent">
                    <SelectValue placeholder="Select priority">
                      {priorityOptions.find(
                        (option) => option.value === taskDetails.priority
                      )?.label || 'Select priority'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <Badge
                            variant="secondary"
                            className={`mr-2 ${option.color} text-white`}
                          >
                            <span className="mr-1">{option.icon}</span>
                            {option.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Description</span>
            <MinimalTiptapEditor
              value={taskDetails.description || ''}
              onChange={(value) =>
                handleChange({
                  target: { name: 'description', value: value as string },
                } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
              }
              className={cn(
                'min-h-[150px] focus-visible:ring-0',
                'border-transparent hover:border-input focus:border-input',
                'transition-colors duration-200'
              )}
              editorContentClassName="p-5"
              output="html"
              placeholder="Type your description here..."
              editable={true}
              editorClassName="focus:outline-none"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Create Task</Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
