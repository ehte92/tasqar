import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { TaskStatus, TaskPriority } from '@/types/task';

const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.date().optional().nullable(),
  userId: z.string().cuid('Invalid user ID'),
  projectId: z.string().cuid('Invalid project ID').optional().nullable(),
});

const taskUpdateSchema = taskSchema.partial().extend({
  id: z.string().cuid('Invalid task ID'),
});

function handleError(error: unknown) {
  console.error(error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.errors }, { status: 400 });
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new Error('User ID is required');
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = taskSchema.parse(body);
    const newTask = await prisma.task.create({ data: validatedData });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedData = taskUpdateSchema.parse(body);
    const { id, ...updateData } = validatedData;
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      throw new Error('Task ID is required');
    }
    z.string().cuid('Invalid task ID').parse(id);
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
}
