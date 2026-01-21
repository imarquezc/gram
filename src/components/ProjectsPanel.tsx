import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ProjectCard } from './ProjectCard';

export function ProjectsPanel() {
  const [newProjectName, setNewProjectName] = useState('');
  const projects = useStore((s) => s.projects);
  const addProject = useStore((s) => s.addProject);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Projects</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
            placeholder="New project name..."
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddProject}
            disabled={!newProjectName.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </AnimatePresence>
        {projects.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p>No projects yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
