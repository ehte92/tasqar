'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const initialTasks = [
  { id: 1, title: 'Complete project proposal', completed: false },
  { id: 2, title: 'Review team performance', completed: true },
  { id: 3, title: 'Update client presentation', completed: false },
  { id: 4, title: 'Prepare for team meeting', completed: false },
];

export function TaskList() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Tasks</CardTitle>
        <Button size="sm" className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center space-x-3">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`text-sm ${
                  task.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {task.title}
              </label>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
