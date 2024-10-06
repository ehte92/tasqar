import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const reorderSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  taskIds: z.array(z.string().cuid('Invalid task ID')),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, taskIds } = reorderSchema.parse(body);

    // Update the order of tasks
    await prisma.$transaction(
      taskIds.map((id, index) =>
        prisma.task.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
