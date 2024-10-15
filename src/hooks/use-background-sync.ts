import { useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

export function useBackgroundSync(queryKey: string[], interval: number) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const syncData = async () => {
      await queryClient.invalidateQueries({ queryKey });
    };

    intervalRef.current = setInterval(syncData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryKey, interval, queryClient]);
}
