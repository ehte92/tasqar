import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  TouchSensor,
  MouseSensor,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTask,
  fetchTasks,
  updateTask,
  deleteTask,
} from '@/services/task-service';
import { fetchProjects } from '@/services/project-service';
import { TaskCard } from './task-card';
import { BoardColumn } from './board-column';
import { ProjectOverview } from './project-overview';
import { hasDraggableData } from './utils';
import { coordinateGetter } from './multipleContainersKeyboardPreset';
import { useSession } from 'next-auth/react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { toast } from 'sonner';
import { CreateTaskInline } from './create-task-inline';
import { AnimatePresence, motion } from 'framer-motion';

export type ColumnId = 'tasks' | 'projects' | 'collaborators';

export interface Column {
  id: ColumnId;
  title: string;
}

const defaultCols: Column[] = [
  { id: 'tasks', title: 'My Tasks' },
  { id: 'projects', title: 'Project Overview' },
  { id: 'collaborators', title: 'Collaborators' },
];

type CreateTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  userId: string;
  projectId?: string | null;
};

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const { data: tasksData = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', session?.user?.id],
    queryFn: () => fetchTasks(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects', session?.user?.id],
    queryFn: () => fetchProjects(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (tasksData) {
      const formattedTasks: Task[] = tasksData.map((task) => ({
        ...task,
        columnId: 'tasks',
        content: task.description || '',
        status: task.status || TaskStatus.TODO,
        priority: task.priority || TaskPriority.MEDIUM,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      }));
      setLocalTasks(formattedTasks);
    }
  }, [tasksData]);

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(
        ['tasks', session?.user?.id],
        (oldTasks = []) => [...oldTasks, newTask]
      );
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create task');
      console.error('Error creating task:', error);
    },
  });

  const handleCreateTask = useCallback(
    (newTask: Partial<Task>) => {
      if (session?.user?.id && newTask.title) {
        const taskInput: CreateTaskInput = {
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status || TaskStatus.TODO,
          priority: newTask.priority || TaskPriority.MEDIUM,
          dueDate: newTask.dueDate || null,
          userId: session.user.id,
          projectId: newTask.projectId || null,
        };
        createTaskMutation.mutate(taskInput);
      } else {
        toast.error('Unable to create task: Missing required fields');
      }
    },
    [createTaskMutation, session?.user?.id]
  );

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({
        queryKey: ['tasks', session?.user?.id],
      });
      const previousTasks = queryClient.getQueryData([
        'tasks',
        session?.user?.id,
      ]);
      queryClient.setQueryData(
        ['tasks', session?.user?.id],
        (old: Task[] | undefined) =>
          old
            ? old.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
              )
            : []
      );
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData(
        ['tasks', session?.user?.id],
        context?.previousTasks
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
    },
  });

  const handleUpdateTask = useCallback(
    (updatedTask: Task) => {
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      updateTaskMutation.mutate(updatedTask);
    },
    [updateTaskMutation]
  );

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({
        queryKey: ['tasks', session?.user?.id],
      });
      const previousTasks = queryClient.getQueryData([
        'tasks',
        session?.user?.id,
      ]);
      queryClient.setQueryData(
        ['tasks', session?.user?.id],
        (old: Task[] | undefined) =>
          old ? old.filter((task) => task.id !== taskId) : []
      );
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      queryClient.setQueryData(
        ['tasks', session?.user?.id],
        context?.previousTasks
      );
      toast.error('Failed to delete task');
    },
    onSuccess: () => {
      toast.success('Task deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
    },
  });

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      deleteTaskMutation.mutate(taskId);
    },
    [deleteTaskMutation]
  );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === 'Column') {
      setActiveColumn(data.column);
    } else if (data?.type === 'Task') {
      setActiveTask(data.task);
    }
  }, []);

  const onDragEnd = useCallback((event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === 'Column';
    const isActiveATask = active.data.current?.type === 'Task';

    if (isActiveAColumn) {
      setColumns((columns) => {
        const activeIndex = columns.findIndex((col) => col.id === activeId);
        const overIndex = columns.findIndex((col) => col.id === overId);
        return arrayMove(columns, activeIndex, overIndex);
      });
    } else if (isActiveATask) {
      setLocalTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }
  }, []);

  const onDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setLocalTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }
  }, []);

  const memoizedTaskCards = useMemo(
    () => (
      <SortableContext items={localTasks.map((task) => task.id)}>
        {localTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </SortableContext>
    ),
    [localTasks, handleUpdateTask, handleDeleteTask]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="flex gap-4 items-start">
        <SortableContext items={columnsId}>
          <AnimatePresence>
            {columns.map((col) => (
              <motion.div
                key={col.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BoardColumn column={col}>
                  {col.id === 'tasks' && (
                    <>
                      <CreateTaskInline onCreateTask={handleCreateTask} />
                      {!isTasksLoading && memoizedTaskCards}
                    </>
                  )}
                  {col.id === 'projects' && !isProjectsLoading && (
                    <ProjectOverview projects={projects} />
                  )}
                  {col.id === 'collaborators' && (
                    <div>Collaborators feature coming soon...</div>
                  )}
                </BoardColumn>
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn column={activeColumn}>
                {activeColumn.id === 'tasks' && memoizedTaskCards}
                {activeColumn.id === 'projects' && (
                  <ProjectOverview projects={projects} />
                )}
                {activeColumn.id === 'collaborators' && (
                  <div>Collaborators feature coming soon...</div>
                )}
              </BoardColumn>
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
