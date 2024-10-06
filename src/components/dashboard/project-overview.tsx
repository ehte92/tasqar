'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Project, ProjectStatus } from '@/types/project';
import { format } from 'date-fns';

async function fetchProjects(userId: string): Promise<Project[]> {
  const response = await fetch(`/api/projects?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

export function ProjectOverview() {
  const [sortOrder, setSortOrder] = useState<'recents' | 'all'>('recents');
  const { data: session } = useSession();

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects', session?.user?.id],
    queryFn: () => fetchProjects(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

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
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setSortOrder(sortOrder === 'recents' ? 'all' : 'recents')
          }
        >
          {sortOrder === 'recents' ? 'Recents' : 'All'} ▼
        </Button>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="flex-grow">
          {isLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading projects...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500">
              Error loading projects. Please try again.
            </p>
          ) : projects && projects.length > 0 ? (
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
