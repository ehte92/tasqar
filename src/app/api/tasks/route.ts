import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { TaskStatus, TaskPriority } from '@/types/task';
import { notificationService } from '@/services/notification-service';
import { NotificationType } from '@prisma/client';

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
  assigneeId: z.string().cuid('Invalid assignee ID').nullable().optional(),
});

const taskUpdateSchema = taskSchema.partial().extend({
  id: z.string().cuid('Invalid task ID'),
  assigneeId: z.string().cuid('Invalid assignee ID').nullable().optional(),
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
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const assigneeId = searchParams.get('assigneeId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ userId: userId }, { assigneeId: assigneeId }],
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
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
        assigneeId: validatedData.assigneeId ?? null,
        order: 0, // Assuming you want to set a default order
      },
    });

    // If the task is assigned to someone other than the creator
    if (
      validatedData.assigneeId &&
      validatedData.assigneeId !== validatedData.userId
    ) {
      await notificationService.createNotification(
        validatedData.assigneeId,
        NotificationType.TASK_ASSIGNMENT,
        `You have been assigned a new task: ${validatedData.title}`,
        newTask.id
      );
    }

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
        assigneeId: updateData.assigneeId || null,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating task:', error);
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
