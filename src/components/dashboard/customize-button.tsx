import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Lock, Unlock } from 'lucide-react';

interface CustomizeButtonProps {
  onToggleDraggable: (isDraggable: boolean) => void;
}

export function CustomizeButton({ onToggleDraggable }: CustomizeButtonProps) {
  const [isDraggable, setIsDraggable] = useState(false);

  const handleToggle = () => {
    const newState = !isDraggable;
    setIsDraggable(newState);
    onToggleDraggable(newState);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleToggle}>
      {isDraggable ? (
        <>
          <Unlock className="mr-2 h-4 w-4" /> Lock Layout
        </>
      ) : (
        <>
          <Lock className="mr-2 h-4 w-4" /> Customize Layout
        </>
      )}
    </Button>
  );
}
