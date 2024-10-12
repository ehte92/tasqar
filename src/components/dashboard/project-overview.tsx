import React from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, MoreHorizontal } from 'lucide-react';
import { Project } from '@/types/project';
import { fetchProjects } from '@/services/project-service';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const CreateProjectDialog = dynamic(() => import('./create-project-dialog'), {
  ssr: false,
});

const EditProjectDialog = dynamic(() => import('./edit-project-dialog'), {
  ssr: false,
});

const ProjectSkeleton = () => (
  <div className="animate-pulse space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
);

const ProjectCard = ({
  project,
  onEdit,
}: {
  project: Project;
  onEdit: (project: Project) => void;
}) => (
  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors duration-200">
    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
      <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
    </div>
    <div className="flex-grow min-w-0">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
        {project.title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {format(new Date(project.createdAt), 'MMM d, yyyy')}
      </p>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onEdit(project)}>
          Edit Project Details
        </DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export function ProjectOverview() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(
    null
  );
  const { data: session } = useSession();

  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(session?.user?.id || ''),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  React.useEffect(() => {
    if (isError) {
      toast.error(`Error loading projects: ${(error as Error).message}`);
    }
  }, [isError, error]);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  return (
    <>
      {isLoading ? (
        <ProjectSkeleton />
      ) : (
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3 px-4 border-dashed"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            <span className="font-normal">Create project</span>
          </Button>
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
            />
          ))}
        </div>
      )}
      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </>
  );
}
