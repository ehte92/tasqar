import { NextResponse } from 'next/server';

import prisma from '@/lib/db';
import { connectionService } from '@/services/connection-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new Error('User ID is required');
    }

    const now = new Date();

    const [completedTasks, pendingTasks, overdueTasks, connections] =
      await Promise.all([
        prisma.task.count({
          where: { userId, status: 'DONE' },
        }),
        prisma.task.count({
          where: { userId, status: { not: 'DONE' } },
        }),
        prisma.task.count({
          where: {
            userId,
            status: { not: 'DONE' },
            dueDate: { lt: now },
          },
        }),
        connectionService
          .getUserConnections(userId)
          .then(
            (connections) =>
              connections.filter((conn) => conn.status === 'ACCEPTED').length
          ),
      ]);

    return NextResponse.json({
      completedTasks,
      pendingTasks,
      overdueTasks,
      connections,
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task stats' },
      { status: 500 }
    );
  }
}
