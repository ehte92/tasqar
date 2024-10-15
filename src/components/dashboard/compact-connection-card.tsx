import React from 'react';

import { ConnectionStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { UserCheck, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ExtendedUserConnection } from '@/components/people/connection-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface CompactConnectionCardProps {
  connection: ExtendedUserConnection;
  currentUserId: string;
  onRemove: () => void;
  onAccept?: () => void;
}

export function CompactConnectionCard({
  connection,
  currentUserId,
  onRemove,
  onAccept,
}: CompactConnectionCardProps) {
  const { t } = useTranslation(['common', 'connection']);
  const otherUser =
    connection.senderId === currentUserId
      ? connection.receiver
      : connection.sender;
  const isPending = connection.status === ConnectionStatus.PENDING;
  const isReceiver = connection.receiverId === currentUserId;

  const getConnectionStatus = () => {
    if (isPending) {
      return isReceiver
        ? t('connection:received', {
            time: formatDistanceToNow(new Date(connection.createdAt)),
          })
        : t('connection:sent', {
            time: formatDistanceToNow(new Date(connection.createdAt)),
          });
    }
    return t('connection:connected', {
      time: formatDistanceToNow(new Date(connection.updatedAt)),
    });
  };

  return (
    <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={otherUser.image || undefined}
            alt={otherUser.name || t('common:user')}
          />
          <AvatarFallback>
            {otherUser.name?.[0] || otherUser.email[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">
            {otherUser.name || otherUser.email}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getConnectionStatus()}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        {isPending && isReceiver && (
          <Button
            size="sm"
            onClick={onAccept}
            aria-label={t('connection:accept')}
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={onRemove}
          aria-label={t('connection:remove')}
        >
          <UserX className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
