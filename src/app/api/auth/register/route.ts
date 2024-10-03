import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import prisma from '@/lib/db';
import {
  createVerificationToken,
  sendVerificationEmail,
} from '@/services/email-verification';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create and send verification token
    const verificationToken = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json(
      {
        message:
          'User registered. Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
