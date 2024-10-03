import { NextResponse } from 'next/server';
import { verifyEmail } from '@/services/email-verification';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Missing verification token' },
      { status: 400 }
    );
  }

  const isVerified = await verifyEmail(token);

  if (isVerified) {
    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { error: 'Invalid or expired verification token' },
      { status: 400 }
    );
  }
}
