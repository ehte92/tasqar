'use client';

import { Suspense } from 'react';
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';
import { TaskStats } from '@/components/dashboard/task-stats';
import { ContentLayout } from '@/components/layouts/content-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { KanbanBoard } from '@/components/dashboard/kanban-board';

export default function DashboardPage() {
  return (
    <ContentLayout title="Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardGreeting />
          </Suspense>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <TaskStats />
        </Suspense>
        <div className="mt-8">
          <Suspense fallback={<LoadingSpinner />}>
            <KanbanBoard />
          </Suspense>
        </div>
      </div>
    </ContentLayout>
  );
}
