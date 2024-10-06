'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function ProjectOverview() {
  const [sortOrder, setSortOrder] = useState('recents');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Projects</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setSortOrder(sortOrder === 'recents' ? 'all' : 'recents')
          }
        >
          {sortOrder === 'recents' ? 'Recents' : 'All'} ▼
        </Button>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="flex-grow">
          {/* Project list will go here */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No projects to display.
          </p>
        </div>
        <Link href="/projects/create" passHref className="mt-4">
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Create project
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
