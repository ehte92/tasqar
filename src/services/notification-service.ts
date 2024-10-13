import prisma from '@/lib/db';

export const notificationService = {
  async createNotification(userId: string, type: string, message: string) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type,
          message,
          userId,
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
};
