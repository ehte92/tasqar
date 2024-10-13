import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { connectionService } from '@/services/connection-service';
import { notificationService } from '@/services/notification-service';

// Schema for validating new connection requests
const newConnectionSchema = z.object({
  email: z.string().email(),
});

// GET /api/connections
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
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

    return NextResponse.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/connections
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email } = newConnectionSchema.parse(body);

    const newConnection = await connectionService.addConnection(
      session.user.id,
      email
    );

    // Create a notification for the receiver
    await notificationService.createNotification(
      newConnection.receiverId,
      'CONNECTION_REQUEST',
      `${session.user.name} sent you a connection request`
    );

    return NextResponse.json(newConnection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating connection:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      {
        status:
          error instanceof Error && error.message === 'User not found'
            ? 404
            : 500,
      }
    );
  }
}

// DELETE /api/connections
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get('id');

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    await connectionService.removeConnection(session.user.id, connectionId);
    return NextResponse.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      {
        status:
          error instanceof Error && error.message === 'Connection not found'
            ? 404
            : 500,
      }
    );
  }
}
