import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new Error('User ID is required');
    }

    const completedTasks = await prisma.task.count({
      where: { userId, status: 'DONE' },
    });

    // For simplicity, we'll just count users. In a real app, you'd implement a proper collaboration system.
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
