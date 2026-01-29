import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CapacityGrid } from './components/CapacityGrid';
import { ProjectsPanel } from './components/ProjectsPanel';
import { useStore } from './store/useStore';
import type { SubProject } from './types';

// Persist layout preferences
const getStoredLayout = (): 'side' | 'bottom' => {
  const stored = localStorage.getItem('gram-layout');
  return stored === 'bottom' ? 'bottom' : 'side';
};

const getStoredHeight = (): number => {
  const stored = localStorage.getItem('gram-timeline-height');
  const height = stored ? parseInt(stored, 10) : 380;
  return isNaN(height) ? 380 : height;
};

function App() {
  const [activeSubProject, setActiveSubProject] = useState<{
    projectId: string;
    subProject: SubProject;
    color: string;
  } | null>(null);

  const [layoutMode, setLayoutMode] = useState<'side' | 'bottom'>(getStoredLayout);
  const [timelineHeight, setTimelineHeight] = useState(getStoredHeight);

  // Persist layout mode
  useEffect(() => {
    localStorage.setItem('gram-layout', layoutMode);
  }, [layoutMode]);

  // Persist timeline height (debounced to avoid excessive writes)
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('gram-timeline-height', String(timelineHeight));
    }, 300);
    return () => clearTimeout(timeout);
  }, [timelineHeight]);
  const [isResizing, setIsResizing] = useState(false);

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

        if (data.isPlaced) {
          unassignSubProject(data.projectId, data.subProject.id);
        }

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
          targetRow = findAvailableRow(startMonth, size);
        }

        if (targetRow !== null) {
          assignSubProject(data.projectId, data.subProject.id, startMonth, targetRow);
        }
      }
    }

    setActiveSubProject(null);
  };

  // Minimum height: header(48) + month headers(52) + grid min(120) + legend(32) + resize(8) + padding(40) ≈ 300
  const minHeight = 280;
  const maxHeight = 800;

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = timelineHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startY;
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + delta));
      setTimelineHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`min-h-screen ${isResizing ? 'select-none' : ''}`}>
        <Header layoutMode={layoutMode} onLayoutToggle={() => setLayoutMode(layoutMode === 'side' ? 'bottom' : 'side')} />

        {layoutMode === 'side' ? (
          <main className="flex gap-5 p-5 pt-4 max-w-full">
            <div className="flex-1 min-w-0">
              <CapacityGrid height={timelineHeight} onResizeStart={handleResizeStart} />
            </div>
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-20">
                <ProjectsPanel maxHeight="calc(100vh - 100px)" />
              </div>
            </div>
          </main>
        ) : (
          <main className="p-5 pt-4 space-y-4 max-w-full">
            <CapacityGrid height={timelineHeight} onResizeStart={handleResizeStart} />
            <ProjectsPanel maxHeight="none" horizontal />
          </main>
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeSubProject && (
          <div
            className="px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-apple-xl cursor-grabbing"
            style={{
              backgroundColor: activeSubProject.color,
              transform: 'scale(1.05)',
            }}
          >
            {activeSubProject.subProject.name}
            <span className="ml-2 opacity-70 text-xs">
              {activeSubProject.subProject.size} {activeSubProject.subProject.size === 1 ? 'month' : 'months'}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
