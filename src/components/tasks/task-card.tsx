import { formatDate } from '@/lib/utils/date';
import { Task } from '@/types/task';

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
      <p className="text-gray-600 mb-2">{task.description}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>
          Due: {task.dueDate ? formatDate(task.dueDate.toISOString()) : 'N/A'}
        </span>
        <span>Status: {task.status}</span>
      </div>
    </div>
  );
}
