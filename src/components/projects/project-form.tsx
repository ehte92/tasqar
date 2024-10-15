import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createProject, updateProject } from '@/services/project-service';
import { ProjectStatus } from '@/types/project';

// Define the form schema using Zod
const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  status: z.nativeEnum(ProjectStatus),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  projectId?: string;
  initialData?: ProjectFormData;
  onSuccess: () => void;
}

export function ProjectForm({
  projectId,
  initialData,
  onSuccess,
}: ProjectFormProps) {
  const isEditMode = !!projectId;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      status: ProjectStatus.PLANNED,
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (isEditMode) {
        await updateProject(projectId, data);
        toast.success('Project updated successfully');
      } else {
        await createProject({ ...data, userId: 'current-user-id' }); // Replace with actual user ID
        toast.success('Project created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error('Failed to submit project');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              id="title"
              {...field}
              placeholder="Project Title"
              aria-invalid={!!errors.title}
            />
          )}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              id="description"
              {...field}
              placeholder="Project Description"
              aria-invalid={!!errors.description}
            />
          )}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select project status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProjectStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? 'Submitting...'
          : isEditMode
            ? 'Update Project'
            : 'Create Project'}
      </Button>
    </form>
  );
}
