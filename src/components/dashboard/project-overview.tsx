import React from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Loader2, MoreHorizontal, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteProject } from '@/hooks/use-delete-project';
import { useProjects } from '@/services/project-service';
import { Project } from '@/types/project';

const CreateProjectDialog = dynamic(() => import('./create-project-dialog'), {
  ssr: false,
});

const EditProjectDialog = dynamic(() => import('./edit-project-dialog'), {
  ssr: false,
});

const ProjectSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-md"
  >
    {[...Array(3)].map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="animate-pulse space-y-2"
      >
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </motion.div>
    ))}
  </motion.div>
);

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}) => {
  const { t } = useTranslation('project');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
        <FileText className="h-5 w-5 text-blue-500 dark:text-blue-300" />
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
            {t('editProjectDetails')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(project.id)}
            className="text-red-600 dark:text-red-400"
          >
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export function ProjectOverview({ projects }: { projects: Project[] }) {
  const { t } = useTranslation('project');
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
      toast.error(
        t('errorLoadingProjects', { error: (error as Error).message })
      );
    }
  }, [isError, error, t]);

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
          toast.success(t('projectDeletedSuccess'));
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          setDeletingProjectId(null);
        },
        onError: (error) => {
          toast.error(
            t('errorDeletingProject', { error: (error as Error).message })
          );
          setDeletingProjectId(null);
        },
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          className="w-full justify-start h-auto py-3 px-4 border-dashed bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          <span className="font-normal">{t('createProject')}</span>
        </Button>
      </motion.div>

      {isLoading ? (
        <ProjectSkeleton />
      ) : (
        <AnimatePresence>
          {projectsData?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </AnimatePresence>
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
              {t('deleteProjectConfirmation')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteProjectWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isDeleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
