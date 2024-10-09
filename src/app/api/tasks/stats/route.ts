import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Instead of using request.url, we'll use query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const completedTasks = await prisma.task.count({
      where: { userId, status: 'DONE' },
    });

    const collaborators = await prisma.user.count();

    return NextResponse.json({ completedTasks, collaborators });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task stats' },
      { status: 500 }
    );
  }
}

// Add this export to make the route dynamic
export const dynamic = 'force-dynamic';
