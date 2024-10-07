import React, { useMemo, useState, useEffect } from 'react';
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
import { fetchTasks, updateTask } from '@/services/task-service';
import { fetchProjects } from '@/services/project-service';
import { TaskCard } from './task-card';
import { BoardColumn } from './board-column';
import { ProjectOverview } from './project-overview';
import { hasDraggableData } from './utils';
import { coordinateGetter } from './multipleContainersKeyboardPreset';
import { useSession } from 'next-auth/react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

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
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

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

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', session?.user?.id] });
    },
  });

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
      setLocalTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          return arrayMove(tasks, activeIndex, overIndex);
        }

        return tasks;
      });
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
      setLocalTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          return arrayMove(tasks, activeIndex, overIndex);
        }

        return tasks;
      });
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
      <div className="flex gap-4 items-start">
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            <BoardColumn key={col.id} column={col}>
              {col.id === 'tasks' && !isTasksLoading && (
                <SortableContext items={localTasks.map((task) => task.id)}>
                  {localTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </SortableContext>
              )}
              {col.id === 'projects' && !isProjectsLoading && (
                <ProjectOverview projects={projects} />
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
                  localTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                {activeColumn.id === 'projects' && (
                  <ProjectOverview projects={projects} />
                )}
                {activeColumn.id === 'collaborators' && (
                  <div>Collaborators feature coming soon...</div>
                )}
              </BoardColumn>
            )}
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
