import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ProjectCard } from './ProjectCard';
import type { SubProject } from '../types';

interface ProjectsPanelProps {
  maxHeight?: string;
  horizontal?: boolean;
}

export function ProjectsPanel({ maxHeight = 'calc(100vh - 100px)', horizontal = false }: ProjectsPanelProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const projects = useStore((s) => s.projects);
  const addProject = useStore((s) => s.addProject);
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [hideDone, setHideDone] = useState(false);

  const isVisible = (sp: SubProject) =>
    (!onlyUnassigned || sp.startMonth === null) && (!hideDone || !sp.done);
  const allSubProjects = projects.flatMap((p) => p.subProjects);
  const unassignedCount = allSubProjects.filter(
    (sp) => sp.startMonth === null && (!hideDone || !sp.done)
  ).length;
  const doneCount = allSubProjects.filter((sp) => sp.done).length;
  // Empty projects stay visible so sub-projects can still be added to them
  const visibleProjects = projects.filter((p) => p.subProjects.length === 0 || p.subProjects.some(isVisible));
  const nothingVisible = (onlyUnassigned || hideDone) && projects.length > 0 && visibleProjects.length === 0;

  const filters = (
    <div className="flex items-center gap-1.5">
      <FilterToggle
        onlyUnassigned={onlyUnassigned}
        unassignedCount={unassignedCount}
        onChange={setOnlyUnassigned}
      />
      <HideDoneToggle hideDone={hideDone} doneCount={doneCount} onChange={setHideDone} />
    </div>
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
            {filters}
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
              <ProjectCard key={project.id} project={project} expanded filter={isVisible} />
            ))}
          </AnimatePresence>
          {nothingVisible && <NothingVisible onlyUnassigned={onlyUnassigned} />}
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
        <h2 className="text-base font-semibold text-gray-900 mb-3">Projects</h2>
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
        <div className="mt-2.5">{filters}</div>
      </div>

      {/* Projects List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <AnimatePresence mode="popLayout">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} filter={isVisible} />
          ))}
        </AnimatePresence>
        {nothingVisible && <NothingVisible onlyUnassigned={onlyUnassigned} />}
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

interface HideDoneToggleProps {
  hideDone: boolean;
  doneCount: number;
  onChange: (hideDone: boolean) => void;
}

function HideDoneToggle({ hideDone, doneCount, onChange }: HideDoneToggleProps) {
  return (
    <button
      onClick={() => onChange(!hideDone)}
      aria-pressed={hideDone}
      title={hideDone ? 'Show sub-projects marked as done' : 'Hide sub-projects marked as done'}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
        hideDone ? 'bg-emerald-50 text-emerald-700' : 'bg-black/5 text-gray-500 hover:text-gray-700'
      }`}
    >
      <span
        className={`w-3 h-3 rounded flex items-center justify-center transition-colors ${
          hideDone ? 'bg-emerald-500 text-white' : 'bg-white ring-1 ring-gray-300'
        }`}
      >
        {hideDone && (
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      Hide done
      <span
        className={`px-1 rounded tabular-nums text-[10px] ${
          hideDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200/70 text-gray-500'
        }`}
      >
        {doneCount}
      </span>
    </button>
  );
}

function NothingVisible({ onlyUnassigned }: { onlyUnassigned: boolean }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-sm">{onlyUnassigned ? 'Everything is scheduled' : 'Everything is done'}</p>
      <p className="text-xs text-gray-300 mt-1">
        {onlyUnassigned ? 'No sub-projects left to place' : 'All sub-projects are marked as done'}
      </p>
    </div>
  );
}
