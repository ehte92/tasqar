'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProjectDetails } from '@/components/projects/project-details';
import { ContentLayout } from '@/components/layouts/content-layout';
import { useBackgroundSync } from '@/hooks/use-background-sync';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
  useBackgroundSync(['projects', params.id], 5 * 60 * 1000);

  return (
    <ContentLayout title="Project Details">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Project Details</h1>
        <ProjectDetails projectId={params.id} />
      </div>
    </ContentLayout>
  );
};

export default ProjectPage;
