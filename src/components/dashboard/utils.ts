import { Active, DataRef, Over } from '@dnd-kit/core';

import { Task } from '@/types/task';

import { Column } from './kanban-board';

export interface ColumnDragData {
  type: 'Column';
  column: Column;
}

export interface TaskDragData {
  type: 'Task';
  task: Task;
}

type DraggableData = ColumnDragData | TaskDragData;

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === 'Column' || data?.type === 'Task') {
    return true;
  }

  return false;
}
