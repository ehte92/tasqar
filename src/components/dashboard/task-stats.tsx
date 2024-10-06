import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Users } from 'lucide-react';

export function TaskStats() {
  return (
    <Card className="mb-8">
      <CardContent className="flex justify-around py-6">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tasks completed
            </p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Collaborators
            </p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
