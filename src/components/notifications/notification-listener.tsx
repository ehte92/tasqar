'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/sse');

    eventSource.onmessage = (event) => {
      const notifications = JSON.parse(event.data);
      queryClient.setQueryData(['notifications'], notifications);
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  return null;
}
