import { useMutation } from '@tanstack/react-query';

import { deleteProject as deleteProjectService } from '@/services/project-service';

export function useDeleteProject() {
  return useMutation({
    mutationFn: (projectId: string) => deleteProjectService(projectId),
  });
}
