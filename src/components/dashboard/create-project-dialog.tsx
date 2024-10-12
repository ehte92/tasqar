import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '@/hooks/use-create-project';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function CreateProjectDialog({
  isOpen,
  onClose,
}: CreateProjectDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const queryClient = useQueryClient();
  const { createProject, isCreating } = useCreateProject();
  const { data: session } = useSession();
  const onSubmit = async (data: ProjectFormData) => {
    try {
      await createProject({
        title: data.title,
        description: data.description,
        userId: session?.user?.id || '',
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your dashboard. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter project title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter project description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <span className="mr-2">Creating...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
