import React, { useRef, useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, ArrowUp } from 'lucide-react';
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

  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollShadow, setShowScrollShadow] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setShowScrollShadow(scrollTop > 0);
      setShowScrollToTop(scrollTop > clientHeight);
    }
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`w-[350px] max-w-full bg-background flex flex-col h-full ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
    >
      <CardHeader className="p-4 font-semibold border-b-2 text-left flex flex-row items-center shrink-0">
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
      <CardContent
        ref={contentRef}
        className={`flex-grow overflow-y-auto p-2 transition-shadow duration-200 ${
          showScrollShadow ? 'shadow-inner' : ''
        }`}
      >
        {children}
      </CardContent>
      {showScrollToTop && (
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-4 right-4 rounded-full"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}
