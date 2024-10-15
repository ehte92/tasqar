import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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

const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

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
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeInOut}
            >
              <DialogHeader>
                <DialogTitle>{t('project:createProject.title')}</DialogTitle>
                <DialogDescription>
                  {t('project:createProject.description')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <motion.div
                  className="space-y-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="title">
                    {t('project:createProject.titleLabel')}
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder={t('project:createProject.titlePlaceholder')}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                  {errors.title && (
                    <motion.p
                      className="text-sm text-red-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.title.message}
                    </motion.p>
                  )}
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="description">
                    {t('project:createProject.descriptionLabel')}
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder={t(
                      'project:createProject.descriptionPlaceholder'
                    )}
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                  {errors.description && (
                    <motion.p
                      className="text-sm text-red-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.description.message}
                    </motion.p>
                  )}
                </motion.div>
                <motion.div
                  className="flex justify-end"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="transition-all duration-200 hover:bg-primary-dark"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('project:createProject.submitting')}
                      </>
                    ) : (
                      t('project:createProject.submit')
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
