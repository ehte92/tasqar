import {
  PrismaClient,
  User,
  UserConnection,
  ConnectionStatus,
} from '@prisma/client';
import { CustomError } from '@/lib/custom-error';
import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import { ExtendedUserConnection } from '@/components/people/connection-card';

const prisma = new PrismaClient();

export const connectionService = {
  /**
   * Fetches all connections for a given user.
   * @param userId - The ID of the user whose connections to fetch.
   * @returns A promise that resolves to an array of UserConnection objects.
   */
  async getUserConnections(userId: string): Promise<UserConnection[]> {
    try {
      const connections = await prisma.userConnection.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
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

      return connections.map((conn) => ({
        ...conn,
        otherUser: conn.senderId === userId ? conn.receiver : conn.sender,
      }));
    } catch (error) {
      console.error('Error fetching user connections:', error);
      throw new CustomError('Failed to fetch connections', 500);
    }
  },

  /**
   * Adds a new connection for a user.
   * @param userId - The ID of the user initiating the connection.
   * @param email - The email of the user to connect with.
   * @returns A promise that resolves to the newly created UserConnection object.
   */
  async addConnection(userId: string, email: string): Promise<UserConnection> {
    try {
      const otherUser = await this.getUserByEmail(email);

      if (!otherUser) {
        throw new CustomError('User not found', 404);
      }

      if (otherUser.id === userId) {
        throw new CustomError('Cannot connect with yourself', 400);
      }

      const existingConnection = await prisma.userConnection.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUser.id },
            { senderId: otherUser.id, receiverId: userId },
          ],
        },
      });

      if (existingConnection) {
        throw new CustomError('Connection already exists', 400);
      }

      const newConnection = await prisma.userConnection.create({
        data: {
          senderId: userId,
          receiverId: otherUser.id,
          status: ConnectionStatus.PENDING,
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

      return newConnection;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error adding connection:', error);
      throw new CustomError('Failed to add connection', 500);
    }
  },

  /**
   * Removes a connection for a user.
   * @param userId - The ID of the user removing the connection.
   * @param connectionId - The ID of the connection to remove.
   */
  async removeConnection(userId: string, connectionId: string): Promise<void> {
    try {
      const connection = await prisma.userConnection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        throw new CustomError('Connection not found', 404);
      }

      if (connection.senderId !== userId && connection.receiverId !== userId) {
        throw new CustomError('Unauthorized to remove this connection', 403);
      }

      await prisma.userConnection.delete({
        where: { id: connectionId },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error removing connection:', error);
      throw new CustomError('Failed to remove connection', 500);
    }
  },

  /**
   * Checks if a user exists by email.
   * @param email - The email of the user to check.
   * @returns A promise that resolves to the User object if found, or null if not found.
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw new CustomError('Failed to check user existence', 500);
    }
  },
};

const CONNECTIONS_CACHE_KEY = 'connections_cache';
const CONNECTIONS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchConnections(): Promise<
  (UserConnection & {
    sender: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    receiver: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  })[]
> {
  const response = await fetch('/api/connections');
  if (!response.ok) {
    throw new Error('Failed to fetch connections');
  }
  return response.json();
}

export function useConnections(userId: string) {
  return useOptimizedQuery<ExtendedUserConnection[]>(
    ['connections'],
    () => fetchConnections(),
    { key: CONNECTIONS_CACHE_KEY, ttl: CONNECTIONS_CACHE_TTL },
    {
      enabled: !!userId,
    }
  );
}
