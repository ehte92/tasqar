import React, { useMemo, useState } from 'react';
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
import { ProjectOverview, ProjectOverviewProps } from './project-overview';
import { hasDraggableData } from './utils';
import { coordinateGetter } from './multipleContainersKeyboardPreset';
import { useSession } from 'next-auth/react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { toast } from 'sonner';
import { CreateTaskInline } from './create-task-inline';
import { Project } from '@/types/project';

export type ColumnId = 'tasks' | 'projects' | 'collaborators';

export interface Column {
  id: ColumnId;
  title: string;
}

const defaultCols: Column[] = [
  {
    id: 'tasks',
    title: 'My Tasks',
  },
  {
    id: 'projects',
    title: 'Project Overview',
  },
  {
    id: 'collaborators',
    title: 'Collaborators',
  },
];

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { data: session } = useSession();
  const queryClient = useQueryClient();

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

  const formattedTasks = useMemo(() => {
    if (!tasksData) return [];
    return tasksData.map((task) => ({
      ...task,
      columnId: 'tasks',
      content: task.description || '',
      status: task.status || TaskStatus.TODO,
      priority: task.priority || TaskPriority.MEDIUM,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    }));
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

  const handleCreateTask = (newTask: Partial<Task>) => {
    if (session?.user?.id) {
      createTaskMutation.mutate({
        ...newTask,
        userId: session.user.id,
      });
    }
  };

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

  const handleUpdateTask = (updatedTask: Task) => {
    updateTaskMutation.mutate(updatedTask);
  };

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

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === 'Column') {
      setActiveColumn(data.column);
    } else if (data?.type === 'Task') {
      setActiveTask(data.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
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

        if (activeIndex !== -1 && overIndex !== -1) {
          return arrayMove(columns, activeIndex, overIndex);
        }

        return columns;
      });
    } else if (isActiveATask) {
      const updatedTasks = arrayMove(
        formattedTasks,
        formattedTasks.findIndex((t) => t.id === activeId),
        formattedTasks.findIndex((t) => t.id === overId)
      );
      queryClient.setQueryData(['tasks', session?.user?.id], updatedTasks);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      const updatedTasks = arrayMove(
        formattedTasks,
        formattedTasks.findIndex((t) => t.id === activeId),
        formattedTasks.findIndex((t) => t.id === overId)
      );
      queryClient.setQueryData(['tasks', session?.user?.id], updatedTasks);
    }

    // Implement logic for dropping a Task into a different column if needed
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="flex gap-28 items-start">
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            <BoardColumn key={col.id} column={col}>
              {col.id === 'tasks' && (
                <>
                  <CreateTaskInline onCreateTask={handleCreateTask} />
                  {!isTasksLoading && (
                    <SortableContext
                      items={formattedTasks.map((task) => task.id)}
                    >
                      {formattedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onUpdateTask={handleUpdateTask}
                          onDeleteTask={handleDeleteTask}
                        />
                      ))}
                    </SortableContext>
                  )}
                </>
              )}
              {col.id === 'projects' && !isProjectsLoading && (
                <ProjectOverview
                  projects={projects as ProjectOverviewProps['projects']}
                />
              )}
              {col.id === 'collaborators' && (
                <div>Collaborators feature coming soon...</div>
              )}
            </BoardColumn>
          ))}
        </SortableContext>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn column={activeColumn}>
                {activeColumn.id === 'tasks' &&
                  formattedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdateTask={handleUpdateTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  ))}
                {activeColumn.id === 'projects' && (
                  <ProjectOverview
                    projects={projects as ProjectOverviewProps['projects']}
                  />
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
