'use client';

import { Suspense } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

import { ContentLayout } from '@/components/layouts/content-layout';
import { useColumns } from '@/components/projects/columns';
import { CreateProjectButton } from '@/components/projects/create-project-button';
import { DataTable } from '@/components/projects/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useBackgroundSync } from '@/hooks/use-background-sync';
import { useProjects } from '@/services/project-service';

export default function ProjectsPage() {
  const { t } = useTranslation('project');
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const columns = useColumns();

  const {
    data: projects,
    isLoading,
    refetch,
  } = useProjects(session?.user?.id as string);

  useBackgroundSync(['projects', userId as string], 5 * 60 * 1000);

  return (
    <ContentLayout title={t('projects')}>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('yourProjects')}</h1>
          <CreateProjectButton />
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <DataTable
            columns={columns}
            data={projects || []}
            refetch={refetch}
            isLoading={isLoading}
          />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
