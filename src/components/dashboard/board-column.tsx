import React, { useRef, useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, ArrowUp } from 'lucide-react';
import { Column } from '@/types/column';
import { Badge } from '@/components/ui/badge';

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
    },
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
      setShowScrollToTop(scrollTop > clientHeight / 2);
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

  const taskCount = React.Children.count(children);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`w-[350px] max-w-full bg-background flex flex-col h-full shadow-md ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      }`}
      {...attributes}
    >
      <CardHeader className="p-3 font-semibold border-b text-left flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center">
          <Button
            variant="ghost"
            {...listeners}
            className="p-1 text-muted-foreground -ml-2 h-auto cursor-grab relative hover:text-primary"
          >
            <span className="sr-only">{`Move column: ${column.title}`}</span>
            <GripVertical className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="ml-2 text-sm font-medium">
            {column.title}
          </Badge>
        </div>
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
          size="icon"
          className="absolute bottom-4 right-4 rounded-full opacity-80 hover:opacity-100 transition-opacity"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}
