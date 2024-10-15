'use client';

import React from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useConnections } from '@/services/connection-service';

import { ConnectionCard } from './connection-card';

async function removeConnection(connectionId: string): Promise<void> {
  const response = await fetch(`/api/connections?id=${connectionId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove connection');
  }
}

export function PeopleList() {
  const { t } = useTranslation('connection');
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data: connections,
    isLoading,
    error,
  } = useConnections(session?.user.id as string);

  const removeMutation = useMutation({
    mutationFn: removeConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success(t('connectionRemovedSuccess'));
    },
    onError: (error) => {
      toast.error(t('failedToRemoveConnection', { error: error.message }));
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
      toast.success(t('connectionAcceptedSuccess'));
    },
    onError: (error) => {
      toast.error(t('failedToAcceptConnection', { error: error.message }));
    },
  });

  if (isLoading) {
    return <ConnectionsSkeleton />;
  }

  if (error) {
    return <div>{t('errorLoadingConnections', { error: error.message })}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence>
        {connections?.map((connection) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ConnectionCard
              connection={connection}
              currentUserId={session?.user.id as string}
              onRemove={() => removeMutation.mutate(connection.id)}
              onAccept={() => acceptMutation.mutate(connection.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function ConnectionsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
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
