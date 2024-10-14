import React from 'react';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div
      data-testid="project-card"
      className="rounded-xl border bg-card text-card-foreground shadow hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold leading-none tracking-tight">
          {project.title}
        </h3>
      </div>
      <div className="p-6 pt-0">
        <p className="text-sm text-gray-600">{project.description}</p>
        <p className="text-sm mt-2">Tasks: {project.tasks?.length ?? 0}</p>
      </div>
    </div>
  );
};
