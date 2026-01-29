import { useDroppable } from '@dnd-kit/core';
import { useStore, getMonthName, getColorHex } from '../store/useStore';
import { PlacedBlock } from './PlacedBlock';

interface CapacityGridProps {
  height: number;
  onResizeStart: (e: React.MouseEvent) => void;
}

export function CapacityGrid({ height, onResizeStart }: CapacityGridProps) {
  const months = Array.from({ length: 12 }, (_, i) => i);
  const monthCapacities = useStore((s) => s.monthCapacities);
  const updateMonthCapacity = useStore((s) => s.updateMonthCapacity);
  const getAllAssignedSubProjects = useStore((s) => s.getAllAssignedSubProjects);
  const unassignSubProject = useStore((s) => s.unassignSubProject);
  const projects = useStore((s) => s.projects);

  const assignedItems = getAllAssignedSubProjects();

  // Calculate max rows needed
  const maxRow = Math.max(
    ...monthCapacities.map((mc) => mc.capacity),
    ...assignedItems.map((item) => item.subProject.row ?? 0)
  );
  const numRows = Math.max(maxRow, 5);

  const rows = Array.from({ length: numRows }, (_, i) => i);

  return (
    <div className="glass rounded-2xl shadow-apple-lg border border-white/50 overflow-hidden flex flex-col" style={{ height }}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-black/5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Timeline</h2>
          <p className="text-xs text-gray-500">
            Drag items from Projects to schedule them
          </p>
        </div>
      </div>

      <div className="px-5 pt-3 pb-2 flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Month headers */}
        <div className="flex mb-2 flex-shrink-0">
          <div className="w-10 flex-shrink-0"></div>
          {months.map((month) => {
            const capacity = monthCapacities.find((mc) => mc.month === month)?.capacity ?? 5;
            return (
              <div key={month} className="flex-1 min-w-[80px] text-center">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  {getMonthName(month)}
                </h3>
                <div className="flex items-center justify-center gap-0.5">
                  <button
                    onClick={() => updateMonthCapacity(month, Math.max(1, capacity - 1))}
                    className="w-5 h-5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/5 flex items-center justify-center transition-all text-xs font-medium"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-medium w-4 text-center text-gray-400 tabular-nums">
                    {capacity}
                  </span>
                  <button
                    onClick={() => updateMonthCapacity(month, capacity + 1)}
                    className="w-5 h-5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/5 flex items-center justify-center transition-all text-xs font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid - Stretches to fill available space */}
        <div className="rounded-xl overflow-hidden border border-gray-200/80 bg-white flex-1 flex flex-col min-h-0">
          {rows.map((rowIndex) => (
            <div
              key={rowIndex}
              className="flex border-b border-gray-100 last:border-b-0 flex-1 min-h-[24px]"
            >
              {/* Row label */}
              <div className="w-10 flex-shrink-0 bg-gray-50/80 border-r border-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-medium">
                {rowIndex + 1}
              </div>

              {/* Month cells */}
              <div className="flex flex-1 relative">
                {months.map((month) => (
                  <GridCell
                    key={month}
                    month={month}
                    row={rowIndex}
                    monthCapacities={monthCapacities}
                  />
                ))}

                {/* Render spanning blocks on top */}
                {assignedItems
                  .filter((item) => item.subProject.row === rowIndex)
                  .map((item) => (
                    <PlacedBlock
                      key={item.subProject.id}
                      project={item.project}
                      subProject={item.subProject}
                      onRemove={() =>
                        unassignSubProject(item.project.id, item.subProject.id)
                      }
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        {projects.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex-shrink-0">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getColorHex(project.color) }}
                  />
                  <span className="text-[11px] font-medium text-gray-600">{project.name}</span>
                  <span className="text-[10px] text-gray-400 tabular-nums">
                    {project.subProjects.reduce((sum, sp) => sum + sp.size, 0)}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={onResizeStart}
        className="h-2 bg-gradient-to-b from-transparent to-gray-200/50 cursor-ns-resize flex items-center justify-center hover:bg-gray-200/80 transition-colors group flex-shrink-0"
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors" />
      </div>
    </div>
  );
}

interface GridCellProps {
  month: number;
  row: number;
  monthCapacities: Array<{ month: number; capacity: number }>;
}

function GridCell({ month, row, monthCapacities }: GridCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${month}-${row}`,
    data: { month, row },
  });

  const capacity = monthCapacities.find((mc) => mc.month === month)?.capacity ?? 5;
  const isOverCapacity = row >= capacity;

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[80px] border-r border-gray-100 last:border-r-0 transition-colors duration-150 ${
        isOver
          ? 'bg-[#A8DF8E]/30'
          : isOverCapacity
            ? 'bg-gradient-to-b from-red-50/50 to-red-50/30'
            : 'bg-white hover:bg-gray-50/50'
      }`}
    />
  );
}
