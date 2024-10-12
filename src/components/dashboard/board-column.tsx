import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, ArrowUp } from 'lucide-react';
import { Column } from './kanban-board';

interface BoardColumnProps {
  column: Column;
  children: React.ReactNode;
}

export const BoardColumn = React.memo(function BoardColumn({
  column,
  children,
}: BoardColumnProps) {
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
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollShadow, setShowScrollShadow] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setShowScrollShadow(scrollTop > 0);
      setShowScrollToTop(scrollTop > 100); // Show button after scrolling 100px
    }
  }, []);

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`w-[350px] max-w-full bg-card flex flex-col h-[calc(100vh-12rem)] rounded-lg shadow-md transition-opacity duration-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
    >
      <CardHeader className="p-4 font-semibold border-b border-border text-left flex flex-row items-center shrink-0 bg-card-header">
        <Button
          variant="ghost"
          {...listeners}
          className="p-1 text-muted-foreground hover:text-primary -ml-2 h-auto cursor-grab relative"
        >
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <GripVertical className="h-5 w-5" />
        </Button>
        <span className="ml-2 text-lg">{column.title}</span>
      </CardHeader>
      <CardContent
        ref={contentRef}
        className="flex-grow overflow-y-auto p-2 space-y-2 transition-shadow duration-200 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 relative"
      >
        {children}
        {showScrollShadow && (
          <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent pointer-events-none" />
        )}
        {showScrollToTop && (
          <Button
            variant="outline"
            size="sm"
            className="sticky bottom-2 left-[calc(100%-2.5rem)] rounded-full opacity-70 hover:opacity-100 transition-opacity duration-200 z-10"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Scroll to top</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
