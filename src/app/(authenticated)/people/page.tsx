import React from 'react';
import { Metadata } from 'next';
import { PeopleList } from '@/components/people/people-list';
import { AddConnectionDialog } from '@/components/people/add-connection-dialog';
import { ContentLayout } from '@/components/layouts/content-layout';
import { UserPlus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'People | Tasqar',
  description: 'Manage your connections and collaborators',
};

export default function PeoplePage() {
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
