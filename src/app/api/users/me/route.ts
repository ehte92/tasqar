import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

import prisma from '@/lib/db';

export async function GET() {
  const session = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  try {
    const updateData: any = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.image) {
      updateData.image = data.image;
    }

    if (data.currentPassword && data.newPassword) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { password: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
