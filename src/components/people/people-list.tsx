'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { UserConnection } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ConnectionCard, ExtendedUserConnection } from './connection-card';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

async function fetchConnections(): Promise<
  (UserConnection & {
    sender: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    receiver: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  })[]
> {
  const response = await fetch('/api/connections');
  if (!response.ok) {
    throw new Error('Failed to fetch connections');
  }
  return response.json();
}

async function removeConnection(connectionId: string): Promise<void> {
  const response = await fetch(`/api/connections?id=${connectionId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove connection');
  }
}

export function PeopleList() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data: connections,
    isLoading,
    error,
  } = useQuery<ExtendedUserConnection[], Error>({
    queryKey: ['connections'],
    queryFn: fetchConnections,
    enabled: !!session,
  });

  const removeMutation = useMutation({
    mutationFn: removeConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection removed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to remove connection: ${error.message}`);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await fetch(`/api/connections/${connectionId}/accept`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to accept connection');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection accepted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to accept connection: ${error.message}`);
    },
  });

  if (isLoading) {
    return <ConnectionsSkeleton />;
  }

  if (error) {
    return <div>Error loading connections: {error.message}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {connections?.map((connection) => (
        <ConnectionCard
          key={connection.id}
          connection={connection}
          currentUserId={session?.user.id as string}
          onRemove={() => removeMutation.mutate(connection.id)}
          onAccept={() => acceptMutation.mutate(connection.id)}
        />
      ))}
    </div>
  );
}

function ConnectionsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
