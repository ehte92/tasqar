import { Suspense } from 'react';
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';
import { TaskSummary } from '@/components/dashboard/task-summary';
import { ProjectOverview } from '@/components/dashboard/project-overview';
import { CustomizeButton } from '@/components/dashboard/customize-button';
import { TaskStats } from '@/components/dashboard/task-stats';
import { ContentLayout } from '@/components/layouts/content-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  return (
    <ContentLayout title="Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardGreeting />
          </Suspense>
        </div>
        <div className="flex justify-end mb-4">
          <CustomizeButton />
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <TaskStats />
        </Suspense>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
          <Suspense fallback={<LoadingSpinner />}>
            <TaskSummary />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectOverview />
          </Suspense>
        </div>
      </div>
    </ContentLayout>
  );
}
