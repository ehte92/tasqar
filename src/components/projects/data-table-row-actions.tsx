'use client';

import { useState } from 'react';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Row } from '@tanstack/react-table';
import dynamic from 'next/dynamic';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteProject } from '@/hooks/use-delete-project';
import { Project } from '@/types/project';

const EditProjectDialog = dynamic(
  () => import('@/components/dashboard/edit-project-dialog'),
  {
    ssr: false,
  }
);

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const project = row.original as Project;
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );
  const queryClient = useQueryClient();

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const handleDeleteProject = (projectId: string) => {
    setDeletingProjectId(projectId);
    setIsDeleteDialogOpen(true);
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => handleEditProject(project)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleDeleteProject(project.id)}
            disabled={isDeleting}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
