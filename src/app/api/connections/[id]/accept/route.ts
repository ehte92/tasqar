import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ConnectionStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connectionId = params.id;

    // Find the connection and ensure it's a pending request for the current user
    const connection = await prisma.userConnection.findUnique({
      where: {
        id: connectionId,
        receiverId: session.user.id,
        status: ConnectionStatus.PENDING,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection request not found or already accepted' },
        { status: 404 }
      );
    }

    // Update the connection status to ACCEPTED
    const updatedConnection = await prisma.userConnection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.ACCEPTED },
    });

    return NextResponse.json(updatedConnection);
  } catch (error) {
    console.error('Error accepting connection request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
