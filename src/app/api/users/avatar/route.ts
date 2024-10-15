import { writeFile } from 'fs/promises';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import path from 'path';

import prisma from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + '-' + file.name.replaceAll(' ', '_');

  try {
    const relativePath = `/uploads/${filename}`;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);
    await writeFile(absolutePath, buffer);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { image: relativePath },
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error saving avatar:', error);
    return NextResponse.json(
      { error: 'Failed to save avatar' },
      { status: 500 }
    );
  }
}
