'use client';

import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useEffect } from 'react';

interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
}

export function useOptimizedQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  cacheConfig: CacheConfig,
  options?: Omit<
    UseQueryOptions<TData, Error, TData, QueryKey>,
    'queryKey' | 'queryFn'
  >
) {
  const { key, ttl } = cacheConfig;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const cachedData = localStorage.getItem(key);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < ttl) {
          return data as TData;
        }
      }
      const freshData = await queryFn();
      localStorage.setItem(
        key,
        JSON.stringify({ data: freshData, timestamp: Date.now() })
      );
      return freshData;
    },
    ...options,
    staleTime: ttl,
  });

  useEffect(() => {
    if (query.data) {
      localStorage.setItem(
        key,
        JSON.stringify({ data: query.data, timestamp: Date.now() })
      );
    }
  }, [query.data, key]);

  return query;
}
