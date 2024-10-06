import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardSummary } from '@/components/dashboard/dashboard-summary';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { TaskChart } from '@/components/dashboard/task-chart';
import { TaskList } from '@/components/dashboard/task-list';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <DashboardHeader />
        <div className="py-4">
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardSummary />
          </Suspense>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<LoadingSpinner />}>
            <TaskChart />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentActivity />
          </Suspense>
          <div className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <TaskList />
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
              <QuickActions />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
