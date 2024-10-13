'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Briefcase, Clock, CheckSquare, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

interface Notification {
  id: string;
  type:
    | 'CONNECTION_REQUEST'
    | 'TASK_ASSIGNMENT'
    | 'PROJECT_UPDATE'
    | 'TASK_DUE_SOON'
    | 'TASK_OVERDUE';
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch('/api/notifications');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}

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
  switch (notification.type) {
    case 'CONNECTION_REQUEST':
      return <Link href="/people">View request</Link>;
    case 'TASK_ASSIGNMENT':
    case 'TASK_DUE_SOON':
    case 'TASK_OVERDUE':
      return <Link href={`/tasks/${notification.relatedId}`}>View task</Link>;
    case 'PROJECT_UPDATE':
      return (
        <Link href={`/projects/${notification.relatedId}`}>View project</Link>
      );
    default:
      return null;
  }
};

export function NotificationDropdown() {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery<Notification[], Error>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notifications marked as read');
    },
    onError: (error) => {
      toast.error(`Error marking notifications as read: ${error.message}`);
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
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAsRead}
              disabled={markAsReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>
        {isLoading ? (
          <DropdownMenuItem>Loading notifications...</DropdownMenuItem>
        ) : error ? (
          <DropdownMenuItem>Error loading notifications</DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem>No notifications</DropdownMenuItem>
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
  );
}
