'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';

const fetchTaskStats = async (userId: string) => {
  const response = await fetch(`/api/tasks/stats?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task stats');
  }
  return response.json();
};

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
        <StatItem
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          label="Tasks completed"
          value={stats?.completedTasks}
          isLoading={isLoading}
          error={error}
        />
        <StatItem
          icon={<Users className="h-8 w-8 text-blue-500" />}
          label="Collaborators"
          value={stats?.collaborators}
          isLoading={isLoading}
          error={error}
        />
      </CardContent>
    </Card>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value?: number;
  isLoading: boolean;
  error: unknown;
}

function StatItem({ icon, label, value, isLoading, error }: StatItemProps) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        ) : error ? (
          <p className="text-sm text-red-500">Error loading stats</p>
        ) : (
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value || 0}
          </p>
        )}
      </div>
    </div>
  );
}
