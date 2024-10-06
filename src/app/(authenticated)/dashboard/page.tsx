'use client';

import { Suspense, useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';
import { TaskSummary } from '@/components/dashboard/task-summary';
import { ProjectOverview } from '@/components/dashboard/project-overview';
import { CustomizeButton } from '@/components/dashboard/customize-button';
import { TaskStats } from '@/components/dashboard/task-stats';
import { ContentLayout } from '@/components/layouts/content-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DraggableWidget } from '@/components/draggable-widget';

interface WidgetPosition {
  [key: string]: { x: number; y: number };
}

export default function DashboardPage() {
  const [widgetPositions, setWidgetPositions] = useState<WidgetPosition>({
    taskSummary: { x: 0, y: 0 },
    projectOverview: { x: 0, y: 0 },
  });
  const [isDraggable, setIsDraggable] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isDraggable) return;

    const { active, delta } = event;
    setWidgetPositions((prev) => ({
      ...prev,
      [active.id]: {
        x: prev[active.id].x + delta.x,
        y: prev[active.id].y + delta.y,
      },
    }));
  };

  const handleToggleDraggable = (draggable: boolean) => {
    setIsDraggable(draggable);
  };

  return (
    <ContentLayout title="Dashboard">
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardGreeting />
            </Suspense>
          </div>
          <div className="flex justify-end mb-4">
            <CustomizeButton onToggleDraggable={handleToggleDraggable} />
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <TaskStats />
          </Suspense>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px] relative">
            <Suspense fallback={<LoadingSpinner />}>
              <DraggableWidget id="taskSummary" isDraggable={isDraggable}>
                <div
                  style={{
                    transform: `translate3d(${widgetPositions.taskSummary.x}px, ${widgetPositions.taskSummary.y}px, 0)`,
                  }}
                >
                  <TaskSummary />
                </div>
              </DraggableWidget>
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
              <DraggableWidget id="projectOverview" isDraggable={isDraggable}>
                <div
                  style={{
                    transform: `translate3d(${widgetPositions.projectOverview.x}px, ${widgetPositions.projectOverview.y}px, 0)`,
                  }}
                >
                  <ProjectOverview />
                </div>
              </DraggableWidget>
            </Suspense>
          </div>
        </div>
      </DndContext>
    </ContentLayout>
  );
}
