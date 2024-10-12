import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { z } from 'zod';

const updateProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const validationResult = updateProjectSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error.format(), { status: 400 });
  }

  const { title, description } = validationResult.data;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: { title, description },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Failed to update project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
