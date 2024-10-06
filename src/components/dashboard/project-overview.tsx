// src/components/dashboard/project-overview.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

async function fetchProjects(userId: string) {
  const response = await fetch(`/api/projects?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

export function ProjectOverview() {
  const [sortOrder, setSortOrder] = useState('recents');
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
            <ul className="space-y-2">
              {projects.map((project: any) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between"
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-sm hover:underline"
                  >
                    {project.title}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
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
