import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  userId: z.string().cuid('Invalid user ID'),
});

const projectUpdateSchema = projectSchema.partial().extend({
  id: z.string().cuid('Invalid project ID'),
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

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return NextResponse.json(projects);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = projectSchema.parse(body);
    const newProject = await prisma.project.create({ data: validatedData });
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedData = projectUpdateSchema.parse(body);
    const { id, ...updateData } = validatedData;
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updatedProject);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      throw new Error('Project ID is required');
    }
    z.string().cuid('Invalid project ID').parse(id);
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
}
