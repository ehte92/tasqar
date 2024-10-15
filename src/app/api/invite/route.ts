import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/db';
import { generateToken } from '@/lib/utils';
import { sendInvitationEmail } from '@/services/email-service';

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = inviteSchema.parse(body);

    // Get the current user's session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if there's an existing invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: { email },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation for this email already exists' },
        { status: 400 }
      );
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Create the invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        expiresAt,
        inviter: {
          connect: { id: session.user.id },
        },
      },
    });

    // Send the invitation email
    await sendInvitationEmail(
      email,
      session.user.name || 'A Tasqar user',
      token
    );

    return NextResponse.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'An error occurred while sending the invitation' },
      { status: 500 }
    );
  }
}
