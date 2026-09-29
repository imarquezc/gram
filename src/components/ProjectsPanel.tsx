import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ProjectCard } from './ProjectCard';

interface ProjectsPanelProps {
  maxHeight?: string;
  horizontal?: boolean;
}

export function ProjectsPanel({ maxHeight = 'calc(100vh - 100px)', horizontal = false }: ProjectsPanelProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const projects = useStore((s) => s.projects);
  const addProject = useStore((s) => s.addProject);
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);

  const isFullyAssigned = (p: (typeof projects)[number]) =>
    p.subProjects.length > 0 && p.subProjects.every((sp) => sp.startMonth !== null);
  const unassignedCount = projects.reduce(
    (sum, p) => sum + p.subProjects.filter((sp) => sp.startMonth === null).length,
    0
  );
  const visibleProjects = onlyUnassigned ? projects.filter((p) => !isFullyAssigned(p)) : projects;
  const allScheduled = onlyUnassigned && projects.length > 0 && visibleProjects.length === 0;

  const filterToggle = (
    <FilterToggle
      onlyUnassigned={onlyUnassigned}
      unassignedCount={unassignedCount}
      onChange={setOnlyUnassigned}
    />
  );

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  // Bottom layout - full width, vertical stacking like original
  if (horizontal) {
    return (
      <div className="glass rounded-2xl shadow-apple-lg border border-white/50 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">Projects</h2>
            {filterToggle}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              placeholder="New project name..."
              className="px-3 py-2 text-sm bg-black/5 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8DF8E]/60 focus:bg-white transition-all placeholder:text-gray-400 w-48"
            />
            <button
              onClick={handleAddProject}
              disabled={!newProjectName.trim()}
              className="px-3 py-2 bg-[#7CB87C] text-white text-sm font-medium rounded-lg hover:bg-[#6aa86a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>
        </div>

        {/* Projects List - Vertical stacking, full width */}
        <div className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} expanded onlyUnassigned={onlyUnassigned} />
            ))}
          </AnimatePresence>
          {allScheduled && <AllScheduled />}
          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm">No projects yet</p>
              <p className="text-xs text-gray-300 mt-1">Create one to get started</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Side layout - compact sidebar
  return (
    <div className="glass rounded-2xl shadow-apple-lg border border-white/50 overflow-hidden flex flex-col" style={{ maxHeight }}>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-black/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Projects</h2>
          {filterToggle}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
            placeholder="New project name..."
            className="flex-1 px-3 py-2 text-sm bg-black/5 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8DF8E]/60 focus:bg-white transition-all placeholder:text-gray-400"
          />
          <button
            onClick={handleAddProject}
            disabled={!newProjectName.trim()}
            className="px-3 py-2 bg-[#7CB87C] text-white text-sm font-medium rounded-lg hover:bg-[#6aa86a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {/* Projects List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <AnimatePresence mode="popLayout">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onlyUnassigned={onlyUnassigned} />
          ))}
        </AnimatePresence>
        {allScheduled && <AllScheduled />}
        {projects.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm">No projects yet</p>
            <p className="text-xs text-gray-300 mt-1">Create one to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterToggleProps {
  onlyUnassigned: boolean;
  unassignedCount: number;
  onChange: (onlyUnassigned: boolean) => void;
}

function FilterToggle({ onlyUnassigned, unassignedCount, onChange }: FilterToggleProps) {
  const base = 'px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1';
  const active = 'bg-white text-gray-900 shadow-sm';
  const inactive = 'text-gray-500 hover:text-gray-700';

  return (
    <div className="flex items-center p-0.5 rounded-lg bg-black/5">
      <button onClick={() => onChange(false)} className={`${base} ${!onlyUnassigned ? active : inactive}`}>
        All
      </button>
      <button
        onClick={() => onChange(true)}
        className={`${base} ${onlyUnassigned ? active : inactive}`}
        title="Show only sub-projects not yet on the timeline"
      >
        Unassigned
        <span
          className={`px-1 rounded tabular-nums text-[10px] ${
            unassignedCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-200/70 text-gray-500'
          }`}
        >
          {unassignedCount}
        </span>
      </button>
    </div>
  );
}

function AllScheduled() {
  return (
    <div className="text-center py-8 text-gray-400">
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-sm">Everything is scheduled</p>
      <p className="text-xs text-gray-300 mt-1">No sub-projects left to place</p>
    </div>
  );
}
