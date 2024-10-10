import React, { useMemo } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { BoardColumn } from './board-column';
import { CreateTaskInline } from './create-task-inline';
import { ProjectOverview } from './project-overview';
import { TaskCard } from './task-card';
import { useKanbanBoard } from '@/hooks/use-kanban-board';
import { DragOverlay } from './drag-overlay';

export function KanbanBoard() {
  const {
    columns,
    columnsId,
    localTasks,
    projects,
    isTasksLoading,
    isProjectsLoading,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    sensors,
    onDragStart,
    onDragEnd,
    onDragOver,
    activeColumn,
    activeTask,
  } = useKanbanBoard();

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
      <div className="h-[calc(100vh-64px)] overflow-x-auto">
        <div className="flex gap-20 items-start h-full">
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
                  className="h-full"
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
      </div>

      <DragOverlay
        activeColumn={activeColumn}
        activeTask={activeTask}
        memoizedTaskCards={memoizedTaskCards}
        projects={projects}
        handleUpdateTask={handleUpdateTask}
        handleDeleteTask={handleDeleteTask}
      />
    </DndContext>
  );
}
