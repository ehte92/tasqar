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
import { Task } from '@/types/task';

export function TaskSummary() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { data: session } = useSession();
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

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
      setNewTaskName('');
      setIsCompleted(false);
      setDueDate(undefined);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
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
      status: isCompleted ? 'DONE' : 'TODO',
      dueDate: dueDate,
      userId: session.user.id,
    });
  };

  const handleUpdateTask = (task: Task) => {
    updateTaskMutation.mutate(task);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

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
            Overdue (3)
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </Button>
        </div>
        <div className="flex-grow">
          {isLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading tasks...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500">
              Error loading tasks. Please try again.
            </p>
          ) : tasks && tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={task.status === 'DONE'}
                    onCheckedChange={(checked) =>
                      handleUpdateTask({
                        ...task,
                        status: checked ? 'DONE' : 'TODO',
                      })
                    }
                  />
                  <span
                    className={task.status === 'DONE' ? 'line-through' : ''}
                  >
                    {task.title}
                  </span>
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
          <form onSubmit={handleSubmitTask} className="mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={(checked) =>
                  setIsCompleted(checked as boolean)
                }
              />
              <Input
                type="text"
                placeholder="Write a task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className="flex-grow"
                autoFocus
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 p-0"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {dueDate && (
              <p className="text-sm text-muted-foreground mt-1">
                Due: {format(dueDate, 'PPP')}
              </p>
            )}
            <Button type="submit" className="mt-2">
              Create Task
            </Button>
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
