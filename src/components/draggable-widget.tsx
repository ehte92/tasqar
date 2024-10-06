import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  isDraggable: boolean;
}

export function DraggableWidget({
  id,
  children,
  isDraggable,
}: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`draggable-widget ${isDraggable ? 'is-draggable' : ''}`}
    >
      {children}
    </div>
  );
}
