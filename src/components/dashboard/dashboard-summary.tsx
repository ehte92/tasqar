import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function DashboardSummary() {
  const summaryItems = [
    {
      title: 'Completed Tasks',
      value: 12,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    { title: 'In Progress', value: 5, icon: Clock, color: 'text-yellow-600' },
    { title: 'Overdue', value: 2, icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {summaryItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
