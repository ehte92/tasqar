import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProject } from '@/services/project-service';

interface CreateProjectData {
  title: string;
  description?: string;
  userId: string;
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    createProject: (data: CreateProjectData) => mutation.mutateAsync(data),
    isCreating: mutation.isPending,
  };
}
