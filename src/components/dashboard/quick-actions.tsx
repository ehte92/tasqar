import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Calendar, FileText } from 'lucide-react';

const actions = [
  { title: 'New Task', icon: PlusCircle, color: 'bg-blue-500' },
  { title: 'Team Meeting', icon: Users, color: 'bg-green-500' },
  { title: 'Schedule', icon: Calendar, color: 'bg-purple-500' },
  { title: 'Reports', icon: FileText, color: 'bg-yellow-500' },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="flex flex-col items-center justify-center h-24 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <action.icon
                className={`h-8 w-8 ${action.color} text-white p-1 rounded-full mb-2`}
              />
              <span className="text-sm">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
