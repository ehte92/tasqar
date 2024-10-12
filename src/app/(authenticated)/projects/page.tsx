'use client';

import { Suspense } from 'react';
import { ContentLayout } from '@/components/layouts/content-layout';
import { ProjectList } from '@/components/projects/project-list';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CreateProjectButton } from '@/components/projects/create-project-button';
import { useSession } from 'next-auth/react';

export default function ProjectsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return (
    <ContentLayout title="Projects">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <CreateProjectButton />
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <ProjectList userId={userId ?? ''} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
