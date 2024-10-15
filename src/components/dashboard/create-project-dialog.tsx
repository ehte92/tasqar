import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '@/hooks/use-create-project';

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
  const { t } = useTranslation(['project', 'common']);
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
      toast.success(t('project:createProject.success'));
      reset();
      onClose();
    } catch (error) {
      toast.error(t('project:createProject.error'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('project:createProject.title')}</DialogTitle>
          <DialogDescription>
            {t('project:createProject.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {t('project:createProject.titleLabel')}
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={t('project:createProject.titlePlaceholder')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              {t('project:createProject.descriptionLabel')}
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('project:createProject.descriptionPlaceholder')}
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
                  <span className="mr-2">
                    {t('project:createProject.submitting')}
                  </span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                t('project:createProject.submit')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
