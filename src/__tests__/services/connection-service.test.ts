import { connectionService } from '@/services/connection-service';
import { PrismaClient, UserConnection, ConnectionStatus } from '@prisma/client';
import { CustomError } from '@/lib/custom-error';
import { MockProxy, mockDeep } from 'jest-mock-extended';

// Mock PrismaClient
jest.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

describe('Connection Service', () => {
  let prisma: MockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    (connectionService as any).prisma = prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserConnections', () => {
    it('should fetch user connections successfully', async () => {
      const mockConnections = [
        {
          id: '1',
          senderId: 'user1',
          receiverId: 'user2',
          status: ConnectionStatus.ACCEPTED,
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: {
            id: 'user1',
            name: 'User 1',
            email: 'user1@example.com',
            image: null,
          },
          receiver: {
            id: 'user2',
            name: 'User 2',
            email: 'user2@example.com',
            image: null,
          },
        },
      ];

      (prisma.userConnection.findMany as jest.Mock).mockResolvedValue(
        mockConnections
      );

      const result = await connectionService.getUserConnections('user1');

      expect(prisma.userConnection.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ senderId: 'user1' }, { receiverId: 'user1' }],
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, image: true },
          },
          receiver: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      });

      expect(result).toEqual([
        {
          ...mockConnections[0],
          otherUser: mockConnections[0].receiver,
        },
      ]);
    });

    it('should throw CustomError when fetching connections fails', async () => {
      (prisma.userConnection.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        connectionService.getUserConnections('user1')
      ).rejects.toThrow(new CustomError('Failed to fetch connections', 500));
    });
  });

  // Add more test cases for other methods (addConnection, removeConnection, getUserByEmail) here
});
