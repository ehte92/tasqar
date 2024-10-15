'use client';

import React from 'react';

import { UserPlus, Users } from 'lucide-react';

import { ContentLayout } from '@/components/layouts/content-layout';
import { AddConnectionDialog } from '@/components/people/add-connection-dialog';
import { PeopleList } from '@/components/people/people-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBackgroundSync } from '@/hooks/use-background-sync';

export default function PeoplePage() {
  useBackgroundSync(['connections'], 5 * 60 * 1000);

  return (
    <ContentLayout title="People">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">People</h1>
          <AddConnectionDialog />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Connections
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12</div>
              <p className="text-xs text-muted-foreground">-3 from last week</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <PeopleList />
        </div>
      </div>
    </ContentLayout>
  );
}
