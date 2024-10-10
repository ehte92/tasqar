import React from 'react';
import { createPortal } from 'react-dom';
import { DragOverlay as DndKitDragOverlay } from '@dnd-kit/core';
import { BoardColumn } from './board-column';
import { TaskCard } from './task-card';
import { ProjectOverview } from './project-overview';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import { Column } from '@/types/column';

interface DragOverlayProps {
  activeColumn: Column | null;
  activeTask: Task | null;
  memoizedTaskCards: React.ReactNode;
  projects: Project[];
  handleUpdateTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
}

export function DragOverlay({
  activeColumn,
  activeTask,
  memoizedTaskCards,
  projects,
  handleUpdateTask,
  handleDeleteTask,
}: DragOverlayProps) {
  return typeof document !== 'undefined'
    ? createPortal(
        <DndKitDragOverlay>
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
        </DndKitDragOverlay>,
        document.body
      )
    : null;
}
