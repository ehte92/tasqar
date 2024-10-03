import TaskList from '@/components/task-list';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <TaskList />
    </main>
  );
}
