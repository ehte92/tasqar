import React from 'react';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchProjectById } from '@/services/project-service';
import { Project, ProjectStatus } from '@/types/project';
import { Task } from '@/types/task';

interface ProjectDetailsProps {
  projectId: string;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projectId,
}) => {
  const { t } = useTranslation(['project', 'common']);
  const {
    data: project,
    isLoading,
    error: projectError,
  } = useFetchProjectById(projectId);

  if (isLoading) return <ProjectDetailsSkeleton />;
  if (projectError) return <ErrorMessage message={projectError.message} />;
  if (!project) return <ErrorMessage message={t('project:notFound')} />;

  const completedTasks =
    project.tasks?.filter((task) => task.status === 'DONE') || [];
  const progressPercentage =
    project.tasks && project.tasks.length > 0
      ? Math.round((completedTasks.length / project.tasks.length) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <ProjectOverview project={project} />
      <ProgressCard
        progressPercentage={progressPercentage}
        completedTasks={completedTasks}
        totalTasks={project.tasks?.length || 0}
      />
    </motion.div>
  );
};

const ProjectOverview: React.FC<{ project: Project }> = ({ project }) => {
  const { t } = useTranslation('project');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-2xl font-bold">{project.title}</span>
          <StatusBadge status={project.status} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{project.description}</p>
        <ProjectDates
          startDate={project.startDate || undefined}
          endDate={project.endDate || undefined}
        />
      </CardContent>
    </Card>
  );
};

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const { t } = useTranslation('project');

  const statusColors: Record<ProjectStatus, string> = {
    [ProjectStatus.PLANNED]: 'bg-blue-500 hover:bg-blue-600',
    [ProjectStatus.ACTIVE]: 'bg-yellow-500 hover:bg-yellow-600',
    [ProjectStatus.COMPLETED]: 'bg-green-500 hover:bg-green-600',
    [ProjectStatus.ON_HOLD]: 'bg-gray-500 hover:bg-gray-600',
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Badge
        className={`${statusColors[status]} transition-colors duration-200`}
      >
        {t(`status.${status}`)}
      </Badge>
    </motion.div>
  );
};

const ProjectDates: React.FC<{ startDate?: string; endDate?: string }> = ({
  startDate,
  endDate,
}) => {
  const { t } = useTranslation('project');

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500">
      {startDate && (
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {t('startDate')}: {new Date(startDate).toLocaleDateString()}
        </span>
      )}
      {endDate && (
        <span className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {t('endDate')}: {new Date(endDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

const ProgressCard: React.FC<{
  progressPercentage: number;
  completedTasks: Task[];
  totalTasks: number;
}> = ({ progressPercentage, completedTasks, totalTasks }) => {
  const { t } = useTranslation('project');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('progress')}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Progress value={progressPercentage} className="w-full h-2" />
        </motion.div>
        <p className="text-sm text-gray-600 mt-2">
          {t('tasksCompleted', {
            completed: completedTasks.length,
            total: totalTasks,
            percentage: progressPercentage,
          })}
        </p>
        <div className="flex justify-between mt-4">
          <TaskStatusIndicator
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            label={t('completedTasks')}
            count={completedTasks.length}
          />
          <TaskStatusIndicator
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            label={t('remainingTasks')}
            count={totalTasks - completedTasks.length}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const TaskStatusIndicator: React.FC<{
  icon: React.ReactNode;
  label: string;
  count: number;
}> = ({ icon, label, count }) => (
  <div className="flex items-center">
    {icon}
    <span className="ml-2 text-sm font-medium">
      {label}: {count}
    </span>
  </div>
);

const ProjectDetailsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-2 w-full mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  const { t } = useTranslation('common');

  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="flex items-center justify-center p-6">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-700">
          {t('error')}: {message}
        </span>
      </CardContent>
    </Card>
  );
};
