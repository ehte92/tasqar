'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Project, ProjectStatus } from '@/types/project';
import { format } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '@/components/sortable-item';
import { fetchProjects, reorderProjects } from '@/services/project-service';
import { toast } from 'sonner';

export function ProjectOverview() {
  const [sortOrder, setSortOrder] = useState<'recents' | 'all'>('recents');
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects', session?.user?.id],
    queryFn: () => fetchProjects(session?.user?.id as string),
    enabled: !!session?.user?.id,
  });

  const reorderProjectsMutation = useMutation({
    mutationFn: reorderProjects,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', session?.user?.id],
      });
      toast.success('Projects reordered successfully');
    },
    onError: (error) => {
      toast.error('Failed to reorder projects');
      console.error('Error reordering projects:', error);
    },
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = projects!.findIndex(
        (project) => project.id === active.id
      );
      const newIndex = projects!.findIndex(
        (project) => project.id === over?.id
      );

      const newOrder = arrayMove(projects!, oldIndex, newIndex);

      // Optimistically update the UI
      queryClient.setQueryData(
        ['projects', session?.user?.id],
        (oldData: Project[] | undefined) => {
          if (!oldData) return oldData;
          return newOrder;
        }
      );

      // Send the update to the server
      reorderProjectsMutation.mutate({
        userId: session?.user?.id as string,
        projectIds: newOrder.map((project) => project.id),
      });
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={projects.map((project) => project.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-4">
                  {projects.map((project) => (
                    <SortableItem key={project.id} id={project.id}>
                      <li className="border-b border-gray-200 dark:border-gray-700 pb-2">
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
                                ? format(
                                    new Date(project.startDate),
                                    'MMM d, yyyy'
                                  )
                                : 'No start date'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {project.tasks.length} tasks
                            </span>
                          </div>
                        </Link>
                      </li>
                    </SortableItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
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
