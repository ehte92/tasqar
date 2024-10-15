import React from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ExtendedUserConnection } from '@/components/people/connection-card';
import { Button } from '@/components/ui/button';
import { useConnections } from '@/services/connection-service';

import { CompactConnectionCard } from './compact-connection-card';

const ConnectionSkeleton = () => (
  <div className="animate-pulse space-y-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-1">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

async function removeConnection(connectionId: string): Promise<void> {
  const response = await fetch(`/api/connections?id=${connectionId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove connection');
  }
}

export function PeopleOverview() {
  const { t } = useTranslation(['common', 'connection']);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data: connections,
    isLoading,
    error,
  } = useConnections(session?.user?.id as string);

  const removeMutation = useMutation({
    mutationFn: removeConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success(t('connection:connectionRemovedSuccess'));
    },
    onError: (error) => {
      toast.error(
        t('connection:failedToRemoveConnection', {
          error: (error as Error).message,
        })
      );
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
      toast.success(t('connection:connectionAcceptedSuccess'));
    },
    onError: (error) => {
      toast.error(
        t('connection:failedToAcceptConnection', {
          error: (error as Error).message,
        })
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, index) => (
          <ConnectionSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {t('common:errorLoadingConnections', {
          error: (error as Error).message,
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full justify-start h-auto py-2 px-3 border-dashed"
        onClick={() =>
          toast.info(t('connection:addConnectionFeatureComingSoon'))
        }
      >
        <UserPlus className="mr-2 h-4 w-4" />
        <span className="text-sm font-normal">
          {t('connection:addConnection')}
        </span>
      </Button>
      <div className="space-y-2">
        {connections?.map((connection: ExtendedUserConnection) => (
          <CompactConnectionCard
            key={connection.id}
            connection={connection}
            currentUserId={session?.user?.id as string}
            onRemove={() => removeMutation.mutate(connection.id)}
            onAccept={() => acceptMutation.mutate(connection.id)}
          />
        ))}
      </div>
    </div>
  );
}
