import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/db';
import { connectionService } from '@/services/connection-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
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
