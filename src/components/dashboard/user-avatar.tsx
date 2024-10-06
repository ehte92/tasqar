'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { User } from 'next-auth';

interface UserAvatarProps {
  user: User | undefined;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const hasImage = user?.image != null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar
            className={`${className} ${
              !hasImage
                ? 'border-2 border-dotted border-gray-300 dark:border-gray-600'
                : ''
            }`}
          >
            <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        {!hasImage && (
          <TooltipContent>
            <p>Upload a profile picture</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
