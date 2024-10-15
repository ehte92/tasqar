'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Content } from '@tiptap/react';
import {
  differenceInDays,
  format,
  isFuture,
  isPast,
  isThisYear,
  isToday,
  isTomorrow,
  isYesterday,
} from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarIcon,
  Check,
  Flag,
  Loader2,
  Paperclip,
  Trash2,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useConnections } from '@/services/connection-service';
import { useProjects } from '@/services/project-service';
import { Task, TaskPriority, TaskStatus } from '@/types/task';

import { MinimalTiptapEditor } from '../minimal-tiptap';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { VisuallyHidden } from '../ui/visually-hidden';

interface EditTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function EditTaskDialog({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
}: EditTaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const { data: session } = useSession();
  const descriptionRef = useRef<string>(task.description || '');

  useEffect(() => {
    setEditedTask(task);
    descriptionRef.current = task.description || '';
  }, [task]);

  const { data: projects = [], isLoading: isProjectsLoading } = useProjects(
    session?.user?.id as string
  );

  const { data: connections = [], isLoading: isConnectionsLoading } =
    useConnections(session?.user?.id as string);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditedTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleDueDateChange = useCallback((date: Date | undefined) => {
    setEditedTask((prev) => ({ ...prev, dueDate: date || null }));
    setIsCalendarOpen(false);
  }, []);

  const clearDueDate = useCallback(() => {
    setEditedTask((prev) => ({ ...prev, dueDate: null }));
    setIsCalendarOpen(false);
  }, []);

  const handleDeleteTask = useCallback(() => {
    setIsDeleting(true);
  }, []);

  const confirmDeleteTask = useCallback(() => {
    onDeleteTask(task.id);
    onClose();
  }, [onDeleteTask, task.id, onClose]);

  const cancelDelete = useCallback(() => {
    setIsDeleting(false);
  }, []);

  const handleProjectChange = useCallback((value: string) => {
    setEditedTask((prev) => ({
      ...prev,
      projectId: value === 'no_project' ? null : value,
    }));
  }, []);

  const toggleTaskStatus = useCallback(async () => {
    setIsTogglingStatus(true);
    const newStatus =
      editedTask.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
    const updatedTask = { ...editedTask, status: newStatus };

    try {
      await onUpdateTask(updatedTask);
      setEditedTask(updatedTask);
      toast.success(
        `Task marked as ${newStatus === TaskStatus.DONE ? 'complete' : 'incomplete'}`
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    } finally {
      setIsTogglingStatus(false);
    }
  }, [editedTask, onUpdateTask]);

  const handlePriorityChange = useCallback((value: TaskPriority) => {
    setEditedTask((prev) => ({ ...prev, priority: value }));
  }, []);

  const priorityOptions = useMemo(
    () => [
      { value: TaskPriority.LOW, label: 'Low', color: 'bg-blue-500' },
      { value: TaskPriority.MEDIUM, label: 'Medium', color: 'bg-yellow-500' },
      { value: TaskPriority.HIGH, label: 'High', color: 'bg-red-500' },
    ],
    []
  );

  const memoizedDueDateButton = useMemo(() => {
    const dueDate = editedTask.dueDate ? new Date(editedTask.dueDate) : null;
    const now = new Date();
    const diffInDays = dueDate ? differenceInDays(dueDate, now) : null;
    const isPastDue = dueDate ? isPast(dueDate) && !isToday(dueDate) : false;
    const isFutureTask = dueDate ? isFuture(dueDate) : false;
    const isIncomplete = editedTask.status !== TaskStatus.DONE;

    const dateText = (() => {
      if (!dueDate) return 'No due date';
      if (isToday(dueDate)) return 'Today';
      if (isTomorrow(dueDate)) return 'Tomorrow';
      if (isYesterday(dueDate)) return 'Yesterday';
      if (diffInDays !== null && diffInDays > 0 && diffInDays < 7)
        return format(dueDate, 'EEEE');
      if (isThisYear(dueDate)) return format(dueDate, 'MMM dd');
      return format(dueDate, 'MMM dd, yyyy');
    })();

    return (
      <Button
        variant="ghost"
        className={cn(
          'w-[200px] justify-start text-left font-normal',
          isPastDue && 'text-red-500 hover:text-red-600',
          isFutureTask && isIncomplete && 'text-green-500 hover:text-green-600',
          'transition-colors duration-200'
        )}
        onClick={() => setIsCalendarOpen(true)}
      >
        <CalendarIcon
          className={cn(
            'mr-2 h-4 w-4',
            isPastDue && 'text-red-500 group-hover:text-red-600',
            isFutureTask &&
              isIncomplete &&
              'text-green-500 group-hover:text-green-600'
          )}
        />
        {dateText}
      </Button>
    );
  }, [editedTask.dueDate, editedTask.status]);

  const handleDescriptionChange = useCallback((value: Content) => {
    descriptionRef.current =
      typeof value === 'string' ? value : (value ?? '').toString();
  }, []);

  const handleUpdateTask = useCallback(async () => {
    setIsUpdating(true);
    const updatedTask = {
      ...editedTask,
      description: descriptionRef.current,
      assigneeId: editedTask.assigneeId || null,
    };
    try {
      await onUpdateTask(updatedTask);
      toast.success('Task updated');
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Update failed');
    } finally {
      setIsUpdating(false);
    }
  }, [editedTask, onUpdateTask, onClose]);

  const handleCancelEdit = useCallback(() => {
    if (isUpdating) return; // Prevent closing while updating
    onClose();
  }, [onClose, isUpdating]);

  const handleAssigneeChange = useCallback((value: string) => {
    setEditedTask((prev) => ({ ...prev, assigneeId: value }));
  }, []);

  const getAssigneeDetails = useCallback(
    (assigneeId: string | null) => {
      if (!assigneeId) return null;

      if (assigneeId === session?.user?.id) {
        return {
          name: session.user.name,
          image: session.user.image,
        };
      }

      const connection = connections.find(
        (c) => c.sender.id === assigneeId || c.receiver.id === assigneeId
      );

      if (connection) {
        const user =
          connection.sender.id === assigneeId
            ? connection.sender
            : connection.receiver;
        return {
          name: user.name,
          image: user.image,
        };
      }

      return null;
    },
    [connections, session]
  );
  const assigneeDetails = useMemo(
    () => getAssigneeDetails(editedTask.assigneeId ?? null),
    [editedTask.assigneeId, getAssigneeDetails]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleCancelEdit}>
      <DialogContent
        className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]"
        hideCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>Task Details</DialogTitle>
        </VisuallyHidden>
        <AnimatePresence mode="wait">
          {isDeleting ? (
            <motion.div
              key="delete-confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-red-100 p-4 rounded-md">
                <h2 className="text-lg font-semibold text-red-800">
                  This task will be deleted permanently.
                </h2>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={cancelDelete}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteTask}>
                  Delete
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="task-edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
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
                  onClick={toggleTaskStatus}
                  disabled={isTogglingStatus}
                >
                  {isTogglingStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-1 h-4 w-4" />
                  )}
                  {editedTask.status === TaskStatus.DONE
                    ? 'Completed'
                    : 'Mark complete'}
                </Button>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon">
                    <Paperclip size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteTask}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X size={20} />
                  </Button>
                </div>
              </div>
              <Input
                name="title"
                value={editedTask.title}
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
                  <Select
                    value={editedTask.assigneeId || ''}
                    onValueChange={handleAssigneeChange}
                  >
                    <SelectTrigger className="w-[200px] border-none hover:bg-accent">
                      <SelectValue placeholder="Select assignee">
                        {isConnectionsLoading ? (
                          'Loading...'
                        ) : assigneeDetails ? (
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={assigneeDetails.image || ''} />
                              <AvatarFallback>
                                {assigneeDetails.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{assigneeDetails.name}</span>
                          </div>
                        ) : (
                          'Select assignee'
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={session?.user?.id as string}>
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={session?.user?.image || ''} />
                            <AvatarFallback>
                              {session?.user?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{session?.user?.name} (You)</span>
                        </div>
                      </SelectItem>
                      {connections.map((connection) => {
                        const user =
                          connection.sender.id === session?.user?.id
                            ? connection.receiver
                            : connection.sender;
                        return (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={user.image || ''} />
                                <AvatarFallback>
                                  {user.name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-sm font-medium">Due date</span>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      {memoizedDueDateButton}
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
                  <span className="w-20 text-sm font-medium">Projects</span>
                  <Select
                    value={editedTask.projectId || 'no_project'}
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger className="w-[200px] border-none hover:bg-accent">
                      <SelectValue placeholder="Select a project">
                        {editedTask.projectId
                          ? projects.find((p) => p.id === editedTask.projectId)
                              ?.title
                          : 'No project'}
                      </SelectValue>
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
                        <>
                          <SelectItem value="no_project">No project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-sm font-medium">Priority</span>
                  <Select
                    value={editedTask.priority}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger className="w-[200px] border-none hover:bg-accent">
                      <SelectValue placeholder="Select priority">
                        {priorityOptions.find(
                          (option) => option.value === editedTask.priority
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
                              <Flag className="h-3 w-3 mr-1" />
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Description</span>
                <MinimalTiptapEditor
                  value={descriptionRef.current}
                  onChange={handleDescriptionChange}
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
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleUpdateTask}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
