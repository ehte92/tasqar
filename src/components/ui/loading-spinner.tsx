import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2
        className={cn(
          'h-8 w-8 animate-spin text-primary',
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-12 w-12' : ''
        )}
      />
      {message && <p className="mt-2 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
