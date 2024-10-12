// src/components/dashboard/task-stats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';

async function fetchTaskStats(userId: string) {
  const response = await fetch(`/api/tasks/stats?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task stats');
  }
  return response.json();
}

export function TaskStats() {
  const { data: session } = useSession();

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['taskStats', session?.user?.id],
    queryFn: () => fetchTaskStats(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

  return (
    <Card className="mb-8">
      <CardContent className="flex justify-around py-6">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tasks completed
            </p>
            {isLoading ? (
              <p className="text-2xl font-bold">Loading...</p>
            ) : error ? (
              <p className="text-sm text-red-500">Error loading stats</p>
            ) : (
              <p className="text-2xl font-bold">{stats?.completedTasks || 0}</p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Collaborators
            </p>
            {isLoading ? (
              <p className="text-2xl font-bold">Loading...</p>
            ) : error ? (
              <p className="text-sm text-red-500">Error loading stats</p>
            ) : (
              <p className="text-2xl font-bold">{stats?.collaborators || 0}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
