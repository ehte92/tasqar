import React from 'react';
import { useFetchProjectById } from '@/services/project-service';
import { Project, ProjectStatus } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
import { Task } from '@/types/task';

interface ProjectDetailsProps {
  projectId: string;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projectId,
}) => {
  const {
    data: project,
    isLoading,
    error: projectError,
  } = useFetchProjectById(projectId);

  if (isLoading) return <ProjectDetailsSkeleton />;
  if (projectError) return <ErrorMessage message={projectError.message} />;
  if (!project) return <ErrorMessage message="Project not found" />;

  const completedTasks =
    project.tasks?.filter((task) => task.status === 'DONE') || [];
  const progressPercentage =
    project.tasks && project.tasks.length > 0
      ? Math.round((completedTasks.length / project.tasks.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <ProjectOverview project={project} />
      <ProgressCard
        progressPercentage={progressPercentage}
        completedTasks={completedTasks}
        totalTasks={project.tasks?.length || 0}
      />
    </div>
  );
};

const ProjectOverview: React.FC<{ project: Project }> = ({ project }) => (
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

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const statusColors: Record<ProjectStatus, string> = {
    [ProjectStatus.PLANNED]: 'bg-blue-500 hover:bg-blue-600',
    [ProjectStatus.ACTIVE]: 'bg-yellow-500 hover:bg-yellow-600',
    [ProjectStatus.COMPLETED]: 'bg-green-500 hover:bg-green-600',
    [ProjectStatus.ON_HOLD]: 'bg-gray-500 hover:bg-gray-600',
  };

  return (
    <Badge className={`${statusColors[status]} transition-colors duration-200`}>
      {status}
    </Badge>
  );
};

const ProjectDates: React.FC<{ startDate?: string; endDate?: string }> = ({
  startDate,
  endDate,
}) => (
  <div className="flex items-center space-x-4 text-sm text-gray-500">
    {startDate && (
      <span className="flex items-center">
        <CalendarIcon className="h-4 w-4 mr-1" />
        {new Date(startDate).toLocaleDateString()}
      </span>
    )}
    {endDate && (
      <span className="flex items-center">
        <ClockIcon className="h-4 w-4 mr-1" />
        {new Date(endDate).toLocaleDateString()}
      </span>
    )}
  </div>
);

const ProgressCard: React.FC<{
  progressPercentage: number;
  completedTasks: Task[];
  totalTasks: number;
}> = ({ progressPercentage, completedTasks, totalTasks }) => (
  <Card>
    <CardHeader>
      <CardTitle>Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <Progress value={progressPercentage} className="w-full h-2" />
      <p className="text-sm text-gray-600 mt-2">
        {completedTasks.length} of {totalTasks} tasks completed (
        {progressPercentage}%)
      </p>
    </CardContent>
  </Card>
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
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <Card className="bg-red-50 border-red-200">
    <CardContent className="flex items-center justify-center p-6">
      <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
      <span className="text-red-700">{message}</span>
    </CardContent>
  </Card>
);
