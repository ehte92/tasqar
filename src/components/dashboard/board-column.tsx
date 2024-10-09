import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { Column } from './kanban-board';

export interface ColumnDragData {
  type: 'Column';
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  children: React.ReactNode;
}

export function BoardColumn({ column, children }: BoardColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    } as ColumnDragData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`w-[350px] max-w-full bg-background flex flex-col flex-shrink-0 ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
    >
      <CardHeader className="p-4 font-semibold border-b-2 text-left flex flex-row items-center">
        <Button
          variant="ghost"
          {...listeners}
          className="p-1 text-primary/50 -ml-2 h-auto cursor-grab relative"
        >
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <GripVertical />
        </Button>
        <span className="ml-2">{column.title}</span>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto p-2">
        {children}
      </CardContent>
    </Card>
  );
}
