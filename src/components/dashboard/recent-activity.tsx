import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PlusCircle, RefreshCw } from 'lucide-react';

const activityItems = [
  {
    user: 'John Doe',
    action: 'completed',
    task: 'Design homepage',
    time: '2 hours ago',
  },
  {
    user: 'Jane Smith',
    action: 'created',
    task: 'Write documentation',
    time: '4 hours ago',
  },
  {
    user: 'Bob Johnson',
    action: 'updated',
    task: 'Fix login bug',
    time: 'Yesterday',
  },
];

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'created':
      return <PlusCircle className="h-4 w-4 text-blue-500" />;
    case 'updated':
      return <RefreshCw className="h-4 w-4 text-yellow-500" />;
    default:
      return null;
  }
};

export function RecentActivity() {
  return (
    <Card className="col-span-1 sm:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activityItems.map((item, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getActivityIcon(item.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.user} {item.action} "{item.task}"
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
