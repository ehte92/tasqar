import { notificationService } from '@/services/notification-service';
import { PrismaClient, NotificationType } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CustomError } from '@/lib/custom-error';

// Mock PrismaClient
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

describe('Notification Service', () => {
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    (notificationService as any).prisma = prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const mockNotification = {
        id: '1',
        type: NotificationType.TASK_ASSIGNMENT,
        message: 'You have been assigned a new task',
        userId: 'user1',
        relatedId: 'task1',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.notification.create.mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification(
        'user1',
        NotificationType.TASK_ASSIGNMENT,
        'You have been assigned a new task',
        'task1'
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          type: NotificationType.TASK_ASSIGNMENT,
          message: 'You have been assigned a new task',
          userId: 'user1',
          relatedId: 'task1',
        },
      });

      expect(result).toEqual(mockNotification);
    });

    it('should throw an error when creation fails', async () => {
      prisma.notification.create.mockRejectedValue(new Error('Database error'));

      await expect(
        notificationService.createNotification(
          'user1',
          NotificationType.TASK_ASSIGNMENT,
          'You have been assigned a new task'
        )
      ).rejects.toThrow('Failed to create notification');
    });
  });

  describe('markAsRead', () => {
    it('should mark notifications as read', async () => {
      const notificationIds = ['1', '2', '3'];
      const userId = 'user1';

      await notificationService.markAsRead(notificationIds, userId);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: notificationIds },
          userId: userId,
        },
        data: {
          read: true,
        },
      });
    });

    it('should throw an error when marking as read fails', async () => {
      prisma.notification.updateMany.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        notificationService.markAsRead(['1', '2'], 'user1')
      ).rejects.toThrow('Failed to mark notifications as read');
    });
  });

  describe('getUnreadCount', () => {
    it('should return the correct unread count', async () => {
      const userId = 'user1';
      const unreadCount = 5;

      prisma.notification.count.mockResolvedValue(unreadCount);

      const result = await notificationService.getUnreadCount(userId);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: {
          userId,
          read: false,
        },
      });

      expect(result).toBe(unreadCount);
    });

    it('should throw an error when getting unread count fails', async () => {
      prisma.notification.count.mockRejectedValue(new Error('Database error'));

      await expect(notificationService.getUnreadCount('user1')).rejects.toThrow(
        'Failed to get unread count'
      );
    });
  });
});
