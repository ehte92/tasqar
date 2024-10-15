import { NextResponse } from 'next/server';

import prisma from '@/lib/db';
import { isValidToken } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      select: { email: true, expiresAt: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (!isValidToken(invitation.expiresAt.toISOString())) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({ email: invitation.email });
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
