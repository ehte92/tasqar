'use client';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import { ContentLayout } from '@/components/layouts/content-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const DashboardGreeting = dynamic(
  () => import('@/components/dashboard/dashboard-greeting'),
  {
    loading: () => <LoadingSpinner />,
  }
);

const TaskStats = dynamic(() => import('@/components/dashboard/task-stats'), {
  loading: () => <LoadingSpinner />,
});

const KanbanBoard = dynamic(
  () => import('@/components/dashboard/kanban-board'),
  {
    loading: () => <LoadingSpinner />,
  }
);

export default function DashboardPage() {
  const { t } = useTranslation('common');

  return (
    <ContentLayout title={t('dashboard.title')}>
      <main role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section role="region" className="mb-8">
          <DashboardGreeting />
        </section>
        <section role="region">
          <h2 className="text-2xl font-semibold mb-4">
            {t('dashboard.taskStats')}
          </h2>
          <TaskStats />
        </section>
        <section role="region" className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t('dashboard.kanbanBoard')}
          </h2>
          <KanbanBoard />
        </section>
      </main>
    </ContentLayout>
  );
}
