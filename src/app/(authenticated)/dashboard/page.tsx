'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
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
  return (
    <ContentLayout title="Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8">
          <DashboardGreeting />
        </section>
        <section>
          <TaskStats />
        </section>
        <section className="mt-8">
          <KanbanBoard />
        </section>
      </div>
    </ContentLayout>
  );
}
