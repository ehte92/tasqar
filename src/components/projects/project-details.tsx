import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProjectById } from '@/services/project-service';
import { Project, ProjectStatus } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
} from 'lucide-react';

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
  } = useQuery<Project, Error>({
    queryKey: ['projects', projectId],
    queryFn: () => fetchProjectById(projectId),
  });

  if (isLoading) return <div>Loading project details...</div>;
  if (projectError)
    return <div>Error loading project: {projectError.message}</div>;
  if (!project) return <div>Project not found</div>;

  const completedTasks =
    project.tasks?.filter((task) => task.status === 'DONE') || [];
  const progressPercentage =
    project.tasks && project.tasks.length > 0
      ? Math.round((completedTasks.length / project.tasks.length) * 100)
      : 0;

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNED:
        return 'bg-blue-500';
      case ProjectStatus.ACTIVE:
        return 'bg-yellow-500';
      case ProjectStatus.COMPLETED:
        return 'bg-green-500';
      case ProjectStatus.ON_HOLD:
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{project.title}</span>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">{project.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {project.startDate &&
                new Date(project.startDate).toLocaleDateString()}
            </span>
            {project.endDate && (
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {new Date(project.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            {completedTasks.length} of {project.tasks?.length} tasks completed (
            {progressPercentage}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {project.tasks?.map((task) => (
              <li key={task.id} className="flex items-center justify-between">
                <span className="flex items-center">
                  {task.status === 'DONE' ? (
                    <CheckCircle2Icon className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <CircleIcon className="h-4 w-4 mr-2 text-gray-300" />
                  )}
                  {task.title}
                </span>
                <Badge variant="outline">{task.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
