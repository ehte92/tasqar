import { TaskList } from '@/components/tasks/task-list';
import { TaskListSkeleton } from '@/components/tasks/task-list-skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Suspense } from 'react';

export const metadata = {
  title: 'Your Tasks',
  description: 'View and manage all your tasks',
};

export default function TasksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Your Tasks"
        description="View and manage all the tasks you've created"
      />
      <Suspense fallback={<TaskListSkeleton />}>
        <TaskList />
      </Suspense>
    </div>
  );
}
