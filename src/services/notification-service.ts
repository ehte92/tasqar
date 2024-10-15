import { NotificationType } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import prisma from '@/lib/db';
import { Notification } from '@/types/notification';

export const notificationService = {
  async createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    relatedId?: string
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type,
          message,
          userId,
          relatedId,
        },
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  },
  async markAsRead(notificationIds: string[], userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: userId,
        },
        data: {
          read: true,
        },
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw new Error('Failed to mark notifications as read');
    }
  },
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw new Error('Failed to get unread count');
    }
  },
};

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch('/api/notifications');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}

export function useNotifications(userId: string) {
  return useQuery<Notification[]>({
    queryKey: ['notifications', userId],
    queryFn: fetchNotifications,
    enabled: !!userId,
    staleTime: 0,
  });
}
