'use client';

import React from 'react';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ContentLayout } from '@/components/layouts/content-layout';
import { ProjectDetails } from '@/components/projects/project-details';
import { ProjectStatusDropdown } from '@/components/projects/project-status-dropdown';
import { ProjectTasks } from '@/components/projects/project-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFetchProjectById } from '@/services/project-service';
import { ProjectStatus } from '@/types/project';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
  const { t } = useTranslation(['project', 'common']);
  const { data: project, isLoading, error } = useFetchProjectById(params.id);

  if (isLoading) {
    return <ProjectPageSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-red-500 mt-8"
      >
        {t('common:error')}: {error.message}
      </motion.div>
    );
  }

  return (
    <ContentLayout title={t('project:projectDetails')}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8"
      >
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h1 className="text-2xl font-bold">{project?.title}</h1>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ProjectStatusDropdown
              projectId={params.id}
              currentStatus={project?.status ?? ProjectStatus.PLANNED}
            />
          </motion.div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t('project:overview')}</TabsTrigger>
            <TabsTrigger value="tasks">{t('project:tasks')}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <ProjectDetails projectId={params.id} />
            </motion.div>
          </TabsContent>
          <TabsContent value="tasks">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <ProjectTasks projectId={params.id} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </ContentLayout>
  );
};

const ProjectPageSkeleton: React.FC = () => (
  <ContentLayout title="Project Details">
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  </ContentLayout>
);

export default ProjectPage;
