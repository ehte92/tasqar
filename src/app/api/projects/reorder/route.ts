import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const reorderSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  projectIds: z.array(z.string().cuid('Invalid project ID')),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, projectIds } = reorderSchema.parse(body);

    // Update the order of projects
    await prisma.$transaction(
      projectIds.map((id, index) =>
        prisma.project.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ message: 'Projects reordered successfully' });
  } catch (error) {
    console.error('Error reordering projects:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
