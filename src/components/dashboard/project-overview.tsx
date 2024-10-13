import React from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, FileText, MoreHorizontal } from 'lucide-react';
import { Project } from '@/types/project';
import { useProjects } from '@/services/project-service';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteProject } from '@/hooks/use-delete-project';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  onDelete,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
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
        <DropdownMenuItem
          onClick={() => onDelete(project.id)}
          className="text-red-600 dark:text-red-400"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export interface ProjectOverviewProps {
  projects: Project[];
}

export function ProjectOverview({ projects }: ProjectOverviewProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(
    null
  );
  const [deletingProjectId, setDeletingProjectId] = React.useState<
    string | null
  >(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const {
    data: projectsData,
    isPending: isLoading,
    isError,
    error,
  } = useProjects(session?.user?.id as string);

  React.useEffect(() => {
    if (isError) {
      toast.error(`Error loading projects: ${(error as Error).message}`);
    }
  }, [isError, error]);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleDeleteProject = (projectId: string) => {
    setDeletingProjectId(projectId);
  };

  const confirmDelete = () => {
    if (deletingProjectId) {
      deleteProject(deletingProjectId, {
        onSuccess: () => {
          toast.success('Project deleted successfully');
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          setDeletingProjectId(null);
        },
        onError: (error) => {
          toast.error(`Error deleting project: ${(error as Error).message}`);
          setDeletingProjectId(null);
        },
      });
    }
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
          {projectsData?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
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
      <AlertDialog
        open={!!deletingProjectId}
        onOpenChange={() => setDeletingProjectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
