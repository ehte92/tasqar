import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { TaskStatus, TaskPriority } from '@/types/task';

const taskSchema = z.object({
  id: z.string().cuid('Invalid task ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  userId: z.string().cuid('Invalid user ID'),
  projectId: z.string().cuid('Invalid project ID').optional().nullable(),
});

const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .nullable()
    .optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime().nullable().optional(),
  userId: z.string().cuid('Invalid user ID'),
  projectId: z.string().cuid('Invalid project ID').nullable().optional(),
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
    const validatedData = taskCreateSchema.parse(body);

    const newTask = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description ?? null,
        status: TaskStatus[validatedData.status],
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        userId: validatedData.userId,
        projectId: validatedData.projectId ?? null,
        order: 0, // Assuming you want to set a default order
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedData = taskUpdateSchema.parse(body);

    const { id, ...updateData } = validatedData;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        status: updateData.status ? TaskStatus[updateData.status] : undefined,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
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
