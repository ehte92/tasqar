'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  Plus,
  Eye,
  Maximize2,
  Minimize2,
  Trash2,
  CalendarIcon,
  Ellipsis,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  CheckCircle,
  ArrowDown,
  Clock,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { UserAvatar } from '@/components/dashboard/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteTask,
  createTask,
  fetchTasks,
  updateTask,
} from '@/services/task-service';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TaskSummary() {
  const [activeTab, setActiveTab] = useState<
    'upcoming' | 'overdue' | 'completed'
  >('upcoming');
  const { data: session } = useSession();
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(
    TaskStatus.TODO
  );
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(
    TaskPriority.MEDIUM
  );
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(
    undefined
  );

  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks', session?.user?.id],
    queryFn: () => fetchTasks(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
      setIsCreatingTask(false);
      resetNewTaskForm();
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create task');
      console.error('Error creating task:', error);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    },
  });

  const handleCreateTask = () => {
    setIsCreatingTask(true);
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    createTaskMutation.mutate({
      title: newTaskName,
      description: newTaskDescription,
      status: newTaskStatus,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      userId: session.user.id,
    });
  };

  const handleUpdateTask = (task: Task) => {
    updateTaskMutation.mutate(task);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const resetNewTaskForm = () => {
    setNewTaskName('');
    setNewTaskDescription('');
    setNewTaskStatus(TaskStatus.TODO);
    setNewTaskPriority(TaskPriority.MEDIUM);
    setNewTaskDueDate(undefined);
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case TaskPriority.MEDIUM:
        return <ArrowRight className="h-4 w-4 text-yellow-500" />;
      case TaskPriority.LOW:
        return <ArrowDown className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case TaskStatus.DONE:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const filteredTasks = tasks?.filter((task) => {
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        return (
          task.status !== TaskStatus.DONE &&
          (!task.dueDate || new Date(task.dueDate) >= now)
        );
      case 'overdue':
        return (
          task.status !== TaskStatus.DONE &&
          task.dueDate &&
          new Date(task.dueDate) < now
        );
      case 'completed':
        return task.status === TaskStatus.DONE;
    }
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <UserAvatar user={session?.user} className="h-8 w-8" />
          <CardTitle className="text-sm font-medium">My tasks</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" /> Create task
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" /> View all my tasks
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Minimize2 className="mr-2 h-4 w-4" /> Half size
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Maximize2 className="mr-2 h-4 w-4" /> Full size
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Remove widget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="flex space-x-2 mb-4">
          <Button
            variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={activeTab === 'overdue' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overdue')}
          >
            Overdue
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </Button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading tasks...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500">
              Error loading tasks. Please try again.
            </p>
          ) : filteredTasks && filteredTasks.length > 0 ? (
            <ul className="space-y-2">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                >
                  <Checkbox
                    checked={task.status === TaskStatus.DONE}
                    onCheckedChange={(checked) =>
                      handleUpdateTask({
                        ...task,
                        status: checked ? TaskStatus.DONE : TaskStatus.TODO,
                      })
                    }
                  />
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <span
                        className={
                          task.status === TaskStatus.DONE
                            ? 'line-through text-gray-500'
                            : ''
                        }
                      >
                        {task.title}
                      </span>
                      {getPriorityIcon(task.priority)}
                      {getStatusIcon(task.status)}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {task.description}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {format(new Date(task.dueDate), 'PPP')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tasks to display.
            </p>
          )}
        </div>
        {isCreatingTask ? (
          <form onSubmit={handleSubmitTask} className="mt-4 space-y-4">
            <Input
              type="text"
              placeholder="Task name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="w-full"
              required
            />
            <Input
              type="text"
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full"
            />
            <div className="flex space-x-2">
              <Select
                value={newTaskStatus}
                onValueChange={(value) => setNewTaskStatus(value as TaskStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newTaskPriority}
                onValueChange={(value) =>
                  setNewTaskPriority(value as TaskPriority)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newTaskDueDate ? (
                    format(newTaskDueDate, 'PPP')
                  ) : (
                    <span>Pick a due date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newTaskDueDate}
                  onSelect={setNewTaskDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-grow">
                Create Task
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreatingTask(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleCreateTask}
          >
            <Plus className="mr-2 h-4 w-4" /> Create task
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
