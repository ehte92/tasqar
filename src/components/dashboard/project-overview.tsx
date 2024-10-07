import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Project, ProjectStatus } from '@/types/project';

interface ProjectOverviewProps {
  projects: Project[];
}

export function ProjectOverview({ projects }: ProjectOverviewProps) {
  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return <Clock className="h-4 w-4 text-blue-500" />;
      case ProjectStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Projects</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="flex-grow overflow-auto">
          {projects.length > 0 ? (
            <ul className="space-y-4">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-2"
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className="block hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {project.title}
                      </span>
                      {getStatusIcon(project.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {project.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {project.startDate
                          ? format(new Date(project.startDate), 'MMM d, yyyy')
                          : 'No start date'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {project.tasks.length} tasks
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No projects to display.
            </p>
          )}
        </div>
        <Link href="/projects/create" passHref className="mt-4">
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Create project
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
