'use client';

import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatItem
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            label={t('dashboard.completedTasks')}
            value={stats?.completedTasks}
            isLoading={isLoading}
            error={error}
            color="bg-green-100 dark:bg-green-900/20"
          />
          <StatItem
            icon={<Clock className="h-8 w-8 text-yellow-500" />}
            label={t('dashboard.pendingTasks')}
            value={stats?.pendingTasks}
            isLoading={isLoading}
            error={error}
            color="bg-yellow-100 dark:bg-yellow-900/20"
          />
          <StatItem
            icon={<AlertCircle className="h-8 w-8 text-red-500" />}
            label={t('dashboard.overdueTasks')}
            value={stats?.overdueTasks}
            isLoading={isLoading}
            error={error}
            color="bg-red-100 dark:bg-red-900/20"
          />
          <StatItem
            icon={<Users className="h-8 w-8 text-blue-500" />}
            label={t('dashboard.connections')}
            value={stats?.connections}
            isLoading={isLoading}
            error={error}
            color="bg-blue-100 dark:bg-blue-900/20"
          />
        </motion.div>
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
  color: string;
}

function StatItem({
  icon,
  label,
  value,
  isLoading,
  error,
  color,
}: StatItemProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={`flex items-center space-x-4 p-6 rounded-lg ${color}`}
      variants={itemVariants}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-grow">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
          {label}
        </p>
        {isLoading ? (
          <motion.div
            className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : error ? (
          <p className="text-sm text-red-500">Error loading stats</p>
        ) : (
          <motion.p
            className="text-3xl font-bold text-gray-900 dark:text-gray-100"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            {value ?? 0}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
