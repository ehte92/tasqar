import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import { ProjectStatus, Project } from '@/types/project';
import { fetchProjects } from '@/services/project-service';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

const CreateProjectDialog = dynamic(() => import('./create-project-dialog'), {
  ssr: false,
});

const ProjectSkeleton = () => (
  <div className="animate-pulse space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
  </div>
);

const getStatusIcon = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />;
    case ProjectStatus.COMPLETED:
      return (
        <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
      );
    default:
      return <Calendar className="h-4 w-4 text-gray-500" aria-hidden="true" />;
  }
};

const ProjectCard = ({ project }: { project: Project }) => (
  <Link
    href={`/projects/${project.id}`}
    className="block hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-200"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium truncate">{project.title}</span>
      {getStatusIcon(project.status)}
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
      {project.description}
    </p>
    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
      <span>
        {project.startDate
          ? format(new Date(project.startDate), 'MMM d, yyyy')
          : 'No start date'}
      </span>
      <span>{project.tasks?.length ?? 0} tasks</span>
    </div>
  </Link>
);

export function ProjectOverview() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const parentRef = React.useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(session?.user?.id || ''),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const rowVirtualizer = useVirtualizer({
    count: projects?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  React.useEffect(() => {
    if (isError) {
      toast.error(`Error loading projects: ${(error as Error).message}`);
    }
  }, [isError, error]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (!projects || projects.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No projects to display. Create your first project to get started!
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Create Your
            First Project
          </Button>
        </div>
      );
    }

    return (
      <div
        ref={parentRef}
        className="h-full overflow-auto"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 absolute top-0 left-0 w-full"
          style={{
            transform: `translateY(${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px)`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => (
            <ProjectCard
              key={virtualItem.key}
              project={projects[virtualItem.index]}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Projects</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Quick Add
        </Button>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {renderContent()}
      </CardContent>
      <CreateProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
}
