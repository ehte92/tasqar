import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export function CustomizeButton() {
  return (
    <Button variant="outline" size="sm">
      <Settings className="mr-2 h-4 w-4" /> Customize
    </Button>
  );
}
