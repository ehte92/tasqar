'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationListener() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const setupEventSource = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource('/api/notifications/sse');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const notifications = JSON.parse(event.data);
          queryClient.setQueryData(['notifications'], notifications);
        } catch (error) {
          console.error('Error parsing notification data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
        setTimeout(setupEventSource, 5000); // Try to reconnect after 5 seconds
      };
    };

    setupEventSource();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [queryClient]);

  return null;
}
