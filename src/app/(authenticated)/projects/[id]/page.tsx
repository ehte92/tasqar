'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProjectDetails } from '@/components/projects/project-details';
import { ContentLayout } from '@/components/layouts/content-layout';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
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
