import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { format, isThisYear, isToday, isTomorrow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarIcon, Check, Flag, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { cn } from '@/lib/utils';
import { useConnections } from '@/services/connection-service';
import { useProjects } from '@/services/project-service';
import { Task, TaskPriority, TaskStatus } from '@/types/task';

import { MinimalTiptapEditor } from '../minimal-tiptap';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Partial<Task>) => void;
  initialData?: Partial<Task>;
}

export function CreateTaskDialog({
  isOpen,
  onClose,
  onCreateTask,
  initialData,
}: CreateTaskDialogProps) {
  const { t } = useTranslation(['common', 'task']);
  const [taskDetails, setTaskDetails] = useState<Partial<Task>>(
    initialData || {}
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { data: session } = useSession();

  const { data: projects = [], isLoading: isProjectsLoading } = useProjects(
    session?.user?.id as string
  );

  const { data: connections = [], isLoading: isConnectionsLoading } =
    useConnections(session?.user?.id as string);

  // Add this useEffect hook to update taskDetails when initialData changes
  useEffect(() => {
    setTaskDetails(initialData || {});
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
        label: t('task:priority.low'),
        color: 'bg-blue-500',
        icon: '🔽',
      },
      {
        value: TaskPriority.MEDIUM,
        label: t('task:priority.medium'),
        color: 'bg-yellow-500',
        icon: '➡️',
      },
      {
        value: TaskPriority.HIGH,
        label: t('task:priority.high'),
        color: 'bg-red-500',
        icon: '🔼',
      },
    ],
    [t]
  );

  const memoizedDueDateButton = useMemo(() => {
    const dueDate = taskDetails.dueDate ? new Date(taskDetails.dueDate) : null;

    const dateText = (() => {
      if (!dueDate) return t('task:noDueDate');
      if (isToday(dueDate)) return t('task:today');
      if (isTomorrow(dueDate)) return t('task:tomorrow');
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
  }, [taskDetails.dueDate, t]);

  const handleSubmit = () => {
    onCreateTask(taskDetails);
    onClose();
  };

  const handleAssigneeChange = useCallback((value: string) => {
    setTaskDetails((prev) => ({ ...prev, assigneeId: value }));
  }, []);

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerChildren = {
    visible: { transition: { staggerChildren: 0.07 } },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]"
        hideCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>{t('task:createNewTask')}</DialogTitle>
        </VisuallyHidden>
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={staggerChildren}
          className="space-y-6"
        >
          <motion.div
            variants={fadeInUpVariants}
            className="flex justify-between items-center mb-4 border-b pb-2"
          >
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'text-sm transition-all duration-300 py-1 px-2',
                taskDetails.status === TaskStatus.DONE
                  ? 'bg-green-900 text-green-200 hover:bg-green-700 border-green-500'
                  : 'bg-gray-800 text-white hover:bg-green-900 hover:text-green-200 border-gray-700 hover:border-green-900'
              )}
              onClick={toggleTaskStatus}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={taskDetails.status}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <Check className="mr-1 h-4 w-4" />
                  {taskDetails.status === TaskStatus.DONE
                    ? t('task:completed')
                    : t('task:markComplete')}
                </motion.div>
              </AnimatePresence>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:rotate-90 transition-transform duration-300"
            >
              <X size={20} />
            </Button>
          </motion.div>
          <motion.div variants={fadeInUpVariants}>
            <Input
              name="title"
              value={taskDetails.title || ''}
              onChange={handleChange}
              placeholder={t('task:taskName')}
              className={cn(
                'text-2xl font-semibold px-0 focus-visible:ring-0',
                'border-transparent hover:border-input transition-colors duration-200',
                'rounded-md'
              )}
            />
          </motion.div>
          <motion.div
            variants={fadeInUpVariants}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="w-20 text-sm font-medium">
                  {t('task:assignee')}
                </span>
                <Select
                  value={taskDetails.assigneeId || session?.user?.id || ''}
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger className="w-full border-none hover:bg-accent">
                    <SelectValue placeholder={t('task:selectAssignee')}>
                      {isConnectionsLoading ? (
                        t('common:loading')
                      ) : (
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage
                              src={
                                connections.find(
                                  (c) =>
                                    c.sender.id === taskDetails.assigneeId ||
                                    c.receiver.id === taskDetails.assigneeId
                                )?.sender.image ||
                                session?.user?.image ||
                                ''
                              }
                            />
                            <AvatarFallback>
                              {
                                (connections.find(
                                  (c) =>
                                    c.sender.id === taskDetails.assigneeId ||
                                    c.receiver.id === taskDetails.assigneeId
                                )?.sender.name ||
                                  session?.user?.name ||
                                  '')[0]
                              }
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {connections.find(
                              (c) =>
                                c.sender.id === taskDetails.assigneeId ||
                                c.receiver.id === taskDetails.assigneeId
                            )?.sender.name ||
                              session?.user?.name ||
                              t('task:selectAssignee')}
                          </span>
                        </div>
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
                        <span>
                          {session?.user?.name} ({t('common:you')})
                        </span>
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
                              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
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
                <span className="w-20 text-sm font-medium">
                  {t('task:dueDate')}
                </span>
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
                        {t('task:clearDueDate')}
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
                <span className="w-20 text-sm font-medium">
                  {t('task:project')}
                </span>
                <Select
                  value={taskDetails.projectId || ''}
                  onValueChange={handleProjectChange}
                  disabled={!!taskDetails.projectId}
                >
                  <SelectTrigger className="w-full border-none hover:bg-accent">
                    <SelectValue placeholder={t('task:selectProject')} />
                  </SelectTrigger>
                  <SelectContent>
                    {isProjectsLoading ? (
                      <SelectItem value="loading">
                        {t('task:loadingProjects')}
                      </SelectItem>
                    ) : projects.length === 0 ? (
                      <SelectItem value="no_projects">
                        {t('task:noProjectsFound')}
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
                <span className="w-20 text-sm font-medium">
                  {t('task:priority.label')}
                </span>
                <Select
                  value={taskDetails.priority || TaskPriority.MEDIUM}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger className="w-full border-none hover:bg-accent">
                    <SelectValue placeholder={t('task:priority.select')}>
                      {priorityOptions.find(
                        (option) => option.value === taskDetails.priority
                      )?.label || t('task:priority.select')}
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
          </motion.div>
          <motion.div variants={fadeInUpVariants} className="space-y-2">
            <span className="text-sm font-medium">{t('task:description')}</span>
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
              placeholder={t('task:descriptionPlaceholder')}
              editable={true}
              editorClassName="focus:outline-none"
            />
          </motion.div>
          <motion.div variants={fadeInUpVariants} className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="relative overflow-hidden group"
            >
              <span className="relative z-10">{t('task:createTask')}</span>
              <motion.div
                className="absolute inset-0 bg-primary-600"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
