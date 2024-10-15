import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

import { fetchNotifications } from '@/app/actions/notifications';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  let controller: ReadableStreamDefaultController;
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      controller.enqueue(encoder.encode('retry: 1000\n\n'));
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  const sendNotifications = async () => {
    try {
      const notifications = await fetchNotifications();
      const data = `data: ${JSON.stringify(notifications)}\n\n`;
      controller.enqueue(encoder.encode(data));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      controller.error(error);
    }
  };

  // Send initial notifications
  await sendNotifications();

  // Set up interval to check for new notifications
  intervalId = setInterval(sendNotifications, 5000);

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
