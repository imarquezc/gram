import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, COLORS } from '../store/useStore';
import { SubProjectChip } from './SubProjectChip';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [newSubProjectName, setNewSubProjectName] = useState('');
  const [newSubProjectSize, setNewSubProjectSize] = useState(1);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const {
    removeProject,
    updateProjectName,
    updateProjectColor,
    toggleProjectCollapse,
    addSubProject,
    removeSubProject,
    updateSubProject,
  } = useStore();

  const totalSize = project.subProjects.reduce((sum, sp) => sum + sp.size, 0);
  const allocatedSize = project.subProjects
    .filter((sp) => sp.startMonth !== null)
    .reduce((sum, sp) => sum + sp.size, 0);

  const handleAddSubProject = () => {
    if (newSubProjectName.trim()) {
      addSubProject(project.id, newSubProjectName.trim(), newSubProjectSize);
      setNewSubProjectName('');
      setNewSubProjectSize(1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200"
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => toggleProjectCollapse(project.id)}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: project.isCollapsed ? -90 : 0 }}
            className="text-slate-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-slate-200"
              style={{ backgroundColor: project.color }}
            />
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-8 left-0 z-[100] bg-white rounded-lg shadow-xl border border-slate-200 p-3 grid grid-cols-5 gap-2 w-48"
                  onClick={(e) => e.stopPropagation()}
                >
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateProjectColor(project.id, color);
                        setShowColorPicker(false);
                      }}
                      className="w-7 h-7 rounded-full hover:scale-110 transition-transform hover:ring-2 hover:ring-slate-400 flex-shrink-0"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            type="text"
            value={project.name}
            onChange={(e) => updateProjectName(project.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-slate-800 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          />

          <span className="text-sm text-slate-500">
            ({allocatedSize}/{totalSize} dev-months)
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this project?')) {
              removeProject(project.id);
            }
          }}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!project.isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-3">
                Drag sub-projects to the timeline to allocate
              </p>

              {/* Sub-projects */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.subProjects.map((sp) => (
                  <SubProjectChip
                    key={sp.id}
                    projectId={project.id}
                    subProject={sp}
                    color={project.color}
                    onRemove={() => removeSubProject(project.id, sp.id)}
                    onUpdateSize={(size) => updateSubProject(project.id, sp.id, { size })}
                    onUpdateName={(name) => updateSubProject(project.id, sp.id, { name })}
                  />
                ))}
                {project.subProjects.length === 0 && (
                  <span className="text-slate-400 text-sm">No sub-projects yet</span>
                )}
              </div>

              {/* Add sub-project form */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubProjectName}
                  onChange={(e) => setNewSubProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubProject()}
                  placeholder="New sub-project..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1">
                  <button
                    onClick={() => setNewSubProjectSize(Math.max(1, newSubProjectSize - 1))}
                    className="w-6 h-6 text-slate-500 hover:text-slate-700"
                  >
                    -
                  </button>
                  <span className="text-sm w-6 text-center">{newSubProjectSize}</span>
                  <button
                    onClick={() => setNewSubProjectSize(newSubProjectSize + 1)}
                    className="w-6 h-6 text-slate-500 hover:text-slate-700"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddSubProject}
                  disabled={!newSubProjectName.trim()}
                  className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
