'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProjectDetails } from '@/components/projects/project-details';
import { ContentLayout } from '@/components/layouts/content-layout';
import { ProjectStatusDropdown } from '@/components/projects/project-status-dropdown';
import { useFetchProjectById } from '@/services/project-service';
import { FileText } from 'lucide-react';
import { ProjectStatus } from '@/types/project';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectTasks } from '@/components/projects/project-tasks';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
  const { data: project, isLoading, error } = useFetchProjectById(params.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading project: {error.message}</div>;
  }

  return (
    <ContentLayout title="Project Details">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h1 className="text-2xl font-bold">{project?.title}</h1>
          </div>
          <ProjectStatusDropdown
            projectId={params.id}
            currentStatus={project?.status ?? ProjectStatus.PLANNED}
          />
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <ProjectDetails projectId={params.id} />
          </TabsContent>
          <TabsContent value="tasks">
            <ProjectTasks projectId={params.id} />
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default ProjectPage;
