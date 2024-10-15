'use client';

import { AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/components/ui/card';
import { useBackgroundSync } from '@/hooks/use-background-sync';
import { useTaskStats } from '@/services/task-service';

export default function TaskStats() {
  const { t } = useTranslation('common');
  const { data: session } = useSession();

  const {
    data: stats,
    isLoading,
    error,
  } = useTaskStats(session?.user?.id as string);

  useBackgroundSync(['taskStats', session?.user?.id as string], 5 * 60 * 1000);

  return (
    <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-6">
        <StatItem
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          label={t('dashboard.completedTasks')}
          value={stats?.completedTasks}
          isLoading={isLoading}
          error={error}
        />
        <StatItem
          icon={<Clock className="h-8 w-8 text-yellow-500" />}
          label={t('dashboard.pendingTasks')}
          value={stats?.pendingTasks}
          isLoading={isLoading}
          error={error}
        />
        <StatItem
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          label={t('dashboard.overdueTasks')}
          value={stats?.overdueTasks}
          isLoading={isLoading}
          error={error}
        />
        <StatItem
          icon={<Users className="h-8 w-8 text-blue-500" />}
          label={t('dashboard.connections')}
          value={stats?.connections}
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
            {value ?? 0}
          </p>
        )}
      </div>
    </div>
  );
}
