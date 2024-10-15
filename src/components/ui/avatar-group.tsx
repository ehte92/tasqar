import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Array<{
    src?: string;
    alt?: string;
    fallback: string;
  }>;
  max?: number;
}

export function AvatarGroup({
  avatars,
  max = 4,
  className,
  ...props
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(avatars.length - max, 0);

  return (
    <div
      className={cn('flex -space-x-4 rtl:space-x-reverse', className)}
      {...props}
    >
      {visibleAvatars.map((avatar, index) => (
        <Avatar key={index} className="border-2 border-background">
          <AvatarImage src={avatar.src} alt={avatar.alt} />
          <AvatarFallback>{avatar.fallback}</AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <Avatar className="border-2 border-background">
          <AvatarFallback>+{remainingCount}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
