import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { Header } from './components/Header';
import { CapacityGrid } from './components/CapacityGrid';
import { ProjectsPanel } from './components/ProjectsPanel';
import { useStore } from './store/useStore';
import type { SubProject } from './types';

function App() {
  const [activeSubProject, setActiveSubProject] = useState<{
    projectId: string;
    subProject: SubProject;
    color: string;
  } | null>(null);

  const { assignSubProject, findAvailableRow, unassignSubProject, isSlotOccupied, projects } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as { projectId: string; subProject: SubProject };
    if (data) {
      const project = projects.find((p) => p.id === data.projectId);
      setActiveSubProject({
        projectId: data.projectId,
        subProject: data.subProject,
        color: project?.color ?? '#3b82f6',
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.data.current) {
      const data = active.data.current as {
        projectId: string;
        subProject: SubProject;
        isPlaced?: boolean;
      };
      const overData = over.data.current as { month: number; row: number } | undefined;

      if (overData?.month !== undefined && overData?.row !== undefined) {
        const startMonth = overData.month;
        const size = data.subProject.size;

        // If the block is already placed, first unassign it temporarily
        if (data.isPlaced) {
          unassignSubProject(data.projectId, data.subProject.id);
        }

        // Check if we can place it at the exact row clicked
        let canPlaceAtRow = true;
        for (let month = startMonth; month < startMonth + size; month++) {
          if (isSlotOccupied(month, overData.row)) {
            canPlaceAtRow = false;
            break;
          }
        }

        let targetRow: number | null = null;
        if (canPlaceAtRow) {
          targetRow = overData.row;
        } else {
          // Find an available row
          targetRow = findAvailableRow(startMonth, size);
        }

        if (targetRow !== null) {
          assignSubProject(data.projectId, data.subProject.id, startMonth, targetRow);
        }
      }
    }

    setActiveSubProject(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <Header />
        <main className="p-6 max-w-full mx-auto space-y-6">
          <CapacityGrid />
          <ProjectsPanel />
        </main>
      </div>

      <DragOverlay>
        {activeSubProject && (
          <div
            className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-2xl cursor-grabbing"
            style={{ backgroundColor: activeSubProject.color }}
          >
            {activeSubProject.subProject.name}
            <span className="ml-2 opacity-75">({activeSubProject.subProject.size} months)</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
