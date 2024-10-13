import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject, useProjects } from '@/services/project-service';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pencil, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ProjectListProps {
  userId: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({ userId }) => {
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useProjects(userId);

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] });
      toast.success('Project deleted', {
        description: 'The project has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error loading projects: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects?.map((project) => (
        <Card key={project.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-gray-600">{project.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Status: {project.status}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href={`/projects/${project.id}`} passHref>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
            <Link href={`/projects/${project.id}/edit`} passHref>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(project.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
