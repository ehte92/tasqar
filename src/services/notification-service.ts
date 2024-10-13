import prisma from '@/lib/db';
import { NotificationType } from '@prisma/client';

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
