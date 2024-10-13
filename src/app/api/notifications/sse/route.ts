import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchNotifications } from '@/app/actions/notifications';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue('retry: 1000\n\n');

      const sendNotifications = async () => {
        const notifications = await fetchNotifications();
        const data = `data: ${JSON.stringify(notifications)}\n\n`;
        controller.enqueue(data);
      };

      // Send initial notifications
      await sendNotifications();

      // Set up interval to check for new notifications
      const intervalId = setInterval(sendNotifications, 5000);

      // Clean up interval when the connection is closed
      return () => clearInterval(intervalId);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
