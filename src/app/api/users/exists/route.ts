import { NextRequest, NextResponse } from 'next/server';

import { CustomError } from '@/lib/custom-error';
import { connectionService } from '@/services/connection-service';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const user = await connectionService.getUserByEmail(email);
    return NextResponse.json(!!user);
  } catch (error) {
    if (error instanceof CustomError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error('Error checking user existence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
