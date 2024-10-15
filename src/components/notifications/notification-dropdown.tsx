'use client';

import React from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Bell, Briefcase, CheckSquare, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBackgroundSync } from '@/hooks/use-background-sync';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/services/notification-service';
import { Notification } from '@/types/notification';

import { NotificationListener } from './notification-listener';

async function markNotificationsAsRead(ids: string[]): Promise<void> {
  const response = await fetch('/api/notifications', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error('Failed to mark notifications as read');
  }
}

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'CONNECTION_REQUEST':
      return <Bell className="h-4 w-4 text-blue-500" />;
    case 'TASK_ASSIGNMENT':
      return <CheckSquare className="h-4 w-4 text-green-500" />;
    case 'PROJECT_UPDATE':
      return <Briefcase className="h-4 w-4 text-purple-500" />;
    case 'TASK_DUE_SOON':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'TASK_OVERDUE':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const NotificationLink = ({ notification }: { notification: Notification }) => {
  const { t } = useTranslation('common');

  switch (notification.type) {
    case 'CONNECTION_REQUEST':
      return <Link href="/people">{t('notifications.connectionRequest')}</Link>;
    case 'TASK_ASSIGNMENT':
    case 'TASK_DUE_SOON':
    case 'TASK_OVERDUE':
      return (
        <Link href={`/tasks/${notification.relatedId}`}>
          {t('notifications.viewTask')}
        </Link>
      );
    case 'PROJECT_UPDATE':
      return (
        <Link href={`/projects/${notification.relatedId}`}>
          {t('notifications.viewProject')}
        </Link>
      );
    default:
      return null;
  }
};

export function NotificationDropdown() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useNotifications(session?.user?.id as string);

  useBackgroundSync(['notifications'], 1000 * 60 * 5);

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notifications marked as read');
    },
    onError: (error) => {
      toast.error(
        `Error marking notifications as read: ${(error as Error).message}`
      );
    },
  });

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = () => {
    if (unreadNotifications.length > 0) {
      const unreadIds = unreadNotifications.map((n) => n.id);
      markAsReadMutation.mutate(unreadIds);
    }
  };

  return (
    <>
      <NotificationListener />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge
                    variant="destructive"
                    className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex justify-between items-center p-2">
            <h3 className="font-semibold">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
                disabled={markAsReadMutation.isPending}
              >
                {t('notifications.markAllAsRead')}
              </Button>
            )}
          </div>
          {isLoading ? (
            <DropdownMenuItem>{t('notifications.loading')}</DropdownMenuItem>
          ) : error ? (
            <DropdownMenuItem>{t('notifications.error')}</DropdownMenuItem>
          ) : notifications.length === 0 ? (
            <DropdownMenuItem>{t('notifications.empty')}</DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start space-x-2 p-2"
              >
                <NotificationIcon type={notification.type} />
                <div className="flex-1">
                  <p
                    className={cn(
                      'text-sm',
                      !notification.read && 'font-semibold'
                    )}
                  >
                    {notification.message}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <NotificationLink notification={notification} />
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
