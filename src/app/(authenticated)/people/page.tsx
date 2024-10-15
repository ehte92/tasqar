'use client';

import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { UserPlus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ContentLayout } from '@/components/layouts/content-layout';
import { AddConnectionDialog } from '@/components/people/add-connection-dialog';
import { PeopleList } from '@/components/people/people-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBackgroundSync } from '@/hooks/use-background-sync';

interface Connection {
  status: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  hover: { scale: 1.05 },
};

export default function PeoplePage() {
  const { t } = useTranslation('connection');
  useBackgroundSync(['connections'], 5 * 60 * 1000);

  const [totalConnections, setTotalConnections] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    async function fetchConnections() {
      try {
        const response = await fetch('/api/connections');
        const data: Connection[] = await response.json();
        setTotalConnections(data.length);
        setPendingRequests(
          data.filter((conn: Connection) => conn.status === 'PENDING').length
        );
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    }

    fetchConnections();
  }, []);

  return (
    <ContentLayout title={t('peoplePageTitle')}>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('peoplePageTitle')}
          </h1>
          <AddConnectionDialog />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={cardVariants} whileHover="hover">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('totalConnections')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{totalConnections}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants} whileHover="hover">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('pendingRequests')}
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{pendingRequests}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-6">
          <PeopleList />
        </div>
      </motion.div>
    </ContentLayout>
  );
}
