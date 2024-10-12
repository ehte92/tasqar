import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Project, ProjectStatus } from '@/types/project';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject } from '@/services/project-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ProjectOverview() {
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects('currentUserId'), // Replace with actual user ID
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      setNewProjectTitle('');
      toast.success('Project created');
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectTitle.trim()) {
      createProjectMutation.mutate({
        title: newProjectTitle.trim(),
        userId: 'currentUserId', // Replace with actual user ID
      });
    }
  };

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

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  if (isError) {
    return <div>Error loading projects. Please try again later.</div>;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Projects</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Quick Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="projectTitle" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="projectTitle"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending
                    ? 'Creating...'
                    : 'Create Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="flex-grow overflow-auto">
          {projects && projects.length > 0 ? (
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
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                No projects to display. Create your first project to get
                started!
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
