import { useFetchProjectById } from '@/services/project-service';

export function useProjectTitle(projectId: string) {
  const { data: project, isLoading, error } = useFetchProjectById(projectId);

  return {
    title: project?.title ?? 'Unknown Project',
    isLoading,
    error,
  };
}
