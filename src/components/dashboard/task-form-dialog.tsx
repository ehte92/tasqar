import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import {
  CalendarIcon,
  X,
  Paperclip,
  Trash2,
  Check,
  AlertCircle,
  Flag,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isThisYear,
  differenceInDays,
  isPast,
  isFuture,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { MinimalTiptapEditor } from '../minimal-tiptap';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '@/services/project-service';

interface TaskFormDialogProps {
  task: Partial<Task>;
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  mode: 'create' | 'edit';
}

export function TaskFormDialog({
  task,
  isOpen,
  onClose,
  onSaveTask,
  onDeleteTask,
  mode,
}: TaskFormDialogProps) {
  const [editedTask, setEditedTask] = useState<Partial<Task>>(task);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects', session?.user?.id],
    queryFn: () => fetchProjects(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setEditedTask({ ...editedTask, dueDate: date || null });
  };

  const clearDueDate = () => {
    setEditedTask({ ...editedTask, dueDate: null });
    setIsCalendarOpen(false);
  };

  const handleSubmit = () => {
    const taskToSave: Partial<Task> = {
      id: editedTask.id,
      title: editedTask.title || '',
      description: editedTask.description || '',
      status: editedTask.status || TaskStatus.TODO,
      priority: editedTask.priority || TaskPriority.MEDIUM,
      dueDate: editedTask.dueDate,
      projectId: editedTask.projectId,
    };
    onSaveTask(taskToSave);
    onClose();
  };

  const handleDeleteTask = () => {
    setIsDeleting(true);
  };

  const confirmDeleteTask = () => {
    if (onDeleteTask && editedTask.id) {
      onDeleteTask(editedTask.id);
    }
    onClose();
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  const handleProjectChange = (value: string) => {
    setEditedTask({ ...editedTask, projectId: value });
  };

  const handlePriorityChange = (value: TaskPriority) => {
    setEditedTask({ ...editedTask, priority: value });
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return <Flag className="h-4 w-4 text-red-500" />;
      case TaskPriority.MEDIUM:
        return <Flag className="h-4 w-4 text-yellow-500" />;
      case TaskPriority.LOW:
        return <Flag className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" hideCloseButton>
        {isDeleting ? (
          <div className="space-y-4">
            <div className="bg-red-100 p-4 rounded-md">
              <h2 className="text-lg font-semibold text-red-800 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                This task will be deleted permanently.
              </h2>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelDelete}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteTask}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'text-sm transition-colors duration-200 py-1 px-2',
                  editedTask.status === TaskStatus.DONE
                    ? 'bg-green-900 text-green-200 hover:bg-green-700 border-green-500'
                    : 'bg-gray-800 text-white hover:bg-green-900 hover:text-green-200 border-gray-700 hover:border-green-900'
                )}
                onClick={() => {
                  const newStatus =
                    editedTask.status === TaskStatus.DONE
                      ? TaskStatus.TODO
                      : TaskStatus.DONE;
                  setEditedTask({ ...editedTask, status: newStatus });
                }}
              >
                <Check className="mr-1 h-4 w-4" />
                {editedTask.status === TaskStatus.DONE
                  ? 'Completed'
                  : 'Mark complete'}
              </Button>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon">
                  <Paperclip size={20} />
                </Button>
                {mode === 'edit' && onDeleteTask && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteTask}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={20} />
                </Button>
              </div>
            </div>
            <div className="space-y-6">
              <Input
                name="title"
                value={editedTask.title || ''}
                onChange={handleChange}
                placeholder="Task name"
                className={cn(
                  'text-2xl font-semibold px-0 focus-visible:ring-0',
                  'border-transparent hover:border-input transition-colors duration-200',
                  'rounded-md'
                )}
              />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-sm font-medium">Assignee</span>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{session?.user?.name}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <X size={16} />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-sm font-medium">Due date</span>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      {(() => {
                        const dueDate = editedTask.dueDate
                          ? new Date(editedTask.dueDate)
                          : null;
                        const now = new Date();
                        const diffInDays = dueDate
                          ? differenceInDays(dueDate, now)
                          : null;
                        const isPastDue = dueDate
                          ? isPast(dueDate) && !isToday(dueDate)
                          : false;
                        const isFutureTask = dueDate
                          ? isFuture(dueDate)
                          : false;
                        const isIncomplete =
                          editedTask.status !== TaskStatus.DONE;

                        const dateText = (() => {
                          if (!dueDate) return 'No due date';
                          if (isToday(dueDate)) return 'Today';
                          if (isTomorrow(dueDate)) return 'Tomorrow';
                          if (isYesterday(dueDate)) return 'Yesterday';
                          if (
                            diffInDays !== null &&
                            diffInDays > 0 &&
                            diffInDays < 7
                          )
                            return format(dueDate, 'EEEE');
                          if (isThisYear(dueDate))
                            return format(dueDate, 'MMM dd');
                          return format(dueDate, 'MMM dd, yyyy');
                        })();

                        return (
                          <Button
                            variant="ghost"
                            className={cn(
                              'w-[200px] justify-start text-left font-normal',
                              isPastDue && 'text-red-500 hover:text-red-600',
                              isFutureTask &&
                                isIncomplete &&
                                'text-green-500 hover:text-green-600',
                              'transition-colors duration-200'
                            )}
                            onClick={() => setIsCalendarOpen(true)}
                          >
                            <CalendarIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                isPastDue &&
                                  'text-red-500 group-hover:text-red-600',
                                isFutureTask &&
                                  isIncomplete &&
                                  'text-green-500 group-hover:text-green-600'
                              )}
                            />
                            {dateText}
                          </Button>
                        );
                      })()}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          editedTask.dueDate
                            ? new Date(editedTask.dueDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          handleDueDateChange(date);
                        }}
                        initialFocus
                      />
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearDueDate}
                        >
                          Clear due date
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {editedTask.dueDate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearDueDate}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-sm font-medium">Priority</span>
                  <Select
                    value={editedTask.priority || TaskPriority.MEDIUM}
                    onValueChange={(value) =>
                      handlePriorityChange(value as TaskPriority)
                    }
                  >
                    <SelectTrigger className="w-[200px] border-none hover:bg-accent">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskPriority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center">
                            {getPriorityIcon(priority as TaskPriority)}
                            <span className="ml-2">{priority}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-sm font-medium">Projects</span>
                  <Select
                    value={editedTask.projectId || ''}
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger className="w-[200px] border-none hover:bg-accent">
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
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Description</span>
                <MinimalTiptapEditor
                  value={editedTask.description || ''}
                  onChange={(value) =>
                    setEditedTask({
                      ...editedTask,
                      description: value as string,
                    })
                  }
                  className={cn(
                    'min-h-[100px] focus-visible:ring-0',
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
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button variant={'ringHover'} onClick={handleSubmit}>
                {mode === 'create' ? 'Create Task' : 'Save Changes'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
