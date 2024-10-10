// src/components/dashboard/task-stats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Users,
  Clock,
  Target,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

async function fetchTaskStats(userId: string) {
  const response = await fetch(`/api/tasks/stats?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task stats');
  }
  return response.json();
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  tooltip: string;
}

const StatItem = ({ icon, label, value, color, tooltip }: StatItemProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {label}
            </p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

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

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg font-medium">Loading stats...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardContent className="flex justify-center items-center py-12 text-red-500">
          <AlertCircle className="h-8 w-8 mr-2" />
          <span className="text-lg font-medium">Error loading stats</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Task Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        <StatItem
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          label="Completed Tasks"
          value={stats?.completedTasks || 0}
          color="bg-green-500"
          tooltip="Total number of tasks you've completed"
        />
        <StatItem
          icon={<Users className="h-6 w-6 text-white" />}
          label="Collaborators"
          value={stats?.collaborators || 0}
          color="bg-blue-500"
          tooltip="Number of people you're collaborating with"
        />
        <StatItem
          icon={<Clock className="h-6 w-6 text-white" />}
          label="In Progress"
          value={stats?.inProgressTasks || 0}
          color="bg-yellow-500"
          tooltip="Tasks currently in progress"
        />
        <StatItem
          icon={<Target className="h-6 w-6 text-white" />}
          label="Completion Rate"
          value={`${stats?.completionRate || 0}%`}
          color="bg-purple-500"
          tooltip="Percentage of tasks completed on time"
        />
      </CardContent>
    </Card>
  );
}
