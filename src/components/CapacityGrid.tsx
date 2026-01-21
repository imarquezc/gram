import { useDroppable } from '@dnd-kit/core';
import { useStore, getMonthName } from '../store/useStore';
import { PlacedBlock } from './PlacedBlock';

export function CapacityGrid() {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Timeline</h2>
        <p className="text-sm text-slate-500">
          Drag sub-projects here. They span horizontally based on size.
        </p>
      </div>

      <div className="relative overflow-x-auto">
        {/* Month headers */}
        <div className="flex mb-3">
          <div className="w-16 flex-shrink-0"></div>
          {months.map((month) => {
            const capacity = monthCapacities.find((mc) => mc.month === month)?.capacity ?? 5;
            return (
              <div key={month} className="flex-1 min-w-[100px] text-center">
                <h3 className="font-semibold text-slate-700 mb-1">{getMonthName(month)}</h3>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => updateMonthCapacity(month, Math.max(1, capacity - 1))}
                    className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-medium w-6 text-center text-slate-500">
                    {capacity}
                  </span>
                  <button
                    onClick={() => updateMonthCapacity(month, capacity + 1)}
                    className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {rows.map((rowIndex) => (
            <div key={rowIndex} className="flex border-b border-slate-100 last:border-b-0">
              {/* Row label */}
              <div className="w-16 flex-shrink-0 bg-slate-50 border-r border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
                {rowIndex + 1}
              </div>

              {/* Month cells */}
              <div className="flex flex-1 relative" style={{ height: '48px' }}>
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
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Projects</h3>
            <div className="flex flex-wrap gap-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm text-slate-600">{project.name}</span>
                  <span className="text-xs text-slate-400">
                    ({project.subProjects.reduce((sum, sp) => sum + sp.size, 0)} dev-months)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
      className={`flex-1 min-w-[100px] border-r border-slate-100 last:border-r-0 transition-colors ${
        isOver ? 'bg-blue-100' : isOverCapacity ? 'bg-red-50' : 'bg-white'
      }`}
    />
  );
}
