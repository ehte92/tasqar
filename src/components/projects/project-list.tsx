import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject, useProjects } from '@/services/project-service';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye, Loader2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  if (isLoading) return <ProjectListSkeleton />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 text-left">Project</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects?.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onDelete={() => deleteMutation.mutate(project.id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ProjectRowProps {
  project: Project;
  onDelete: () => void;
  isDeleting: boolean;
}

const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  onDelete,
  isDeleting,
}) => (
  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="px-4 py-3">
      <div>
        <h3 className="font-medium">{project.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
          {project.description}
        </p>
      </div>
    </td>
    <td className="px-4 py-3">
      <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
    </td>
    <td className="px-4 py-3 text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/projects/${project.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/projects/${project.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-600 focus:text-red-600"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  </tr>
);

const ProjectListSkeleton: React.FC = () => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-800">
          <th className="px-4 py-2 text-left">Project</th>
          <th className="px-4 py-2 text-left">Status</th>
          <th className="px-4 py-2 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, index) => (
          <tr
            key={index}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <td className="px-4 py-3">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </td>
            <td className="px-4 py-3">
              <Skeleton className="h-6 w-20" />
            </td>
            <td className="px-4 py-3 text-right">
              <Skeleton className="h-8 w-8 ml-auto" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center p-4 bg-red-100 text-red-800 rounded-md">
    <p>Error loading projects: {message}</p>
  </div>
);

const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'secondary';
    case 'completed':
      return 'default';
    case 'on hold':
      return 'destructive';
    default:
      return 'outline';
  }
};

// Add this type if it's not already defined elsewhere
interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
}
