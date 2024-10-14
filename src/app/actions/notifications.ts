'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

export async function fetchNotifications() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return []; // Return an empty array instead of throwing an error
  }
}
