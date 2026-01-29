import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, COLORS } from '../store/useStore';
import { SubProjectChip } from './SubProjectChip';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  expanded?: boolean; // Always expanded, no collapse toggle (for bottom layout)
}

export function ProjectCard({ project, expanded = false }: ProjectCardProps) {
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

  // Expanded layout for bottom panel mode - always shows content, more spacious
  if (expanded) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white/80 rounded-xl border border-gray-200/60 overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-4 h-4 rounded-full shadow-sm ring-1 ring-black/10 hover:scale-110 transition-transform"
              style={{ backgroundColor: project.color }}
            />
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-6 left-0 z-[100] bg-white rounded-xl shadow-apple-xl border border-gray-200/80 p-2.5 grid grid-cols-5 gap-1.5 w-[140px]"
                >
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        updateProjectColor(project.id, color);
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-full hover:scale-110 transition-transform ring-1 ring-black/10"
                      style={{ backgroundColor: color }}
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
            className="font-semibold text-sm text-gray-900 bg-transparent border-none outline-none focus:ring-1 focus:ring-violet-500/30 rounded px-1 -mx-1"
          />

          <span className="text-xs text-gray-400 tabular-nums">
            {allocatedSize}/{totalSize} dev-months
          </span>

          <div className="flex-1" />

          <button
            onClick={() => {
              if (confirm('Delete this project?')) {
                removeProject(project.id);
              }
            }}
            className="text-gray-300 hover:text-red-500 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Content - Always visible */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">
            Drag sub-projects to the timeline to allocate
          </p>

          {/* Sub-projects - flex wrap to use horizontal space */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
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
              <span className="text-gray-300 text-sm py-1">No sub-projects yet</span>
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
              className="flex-1 px-3 py-2 text-sm bg-gray-100/80 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:bg-white transition-all placeholder:text-gray-400"
            />
            <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg px-2 py-1">
              <button
                onClick={() => setNewSubProjectSize(Math.max(1, newSubProjectSize - 1))}
                className="w-6 h-6 text-gray-500 hover:text-gray-700"
              >
                -
              </button>
              <span className="text-sm w-6 text-center tabular-nums">{newSubProjectSize}</span>
              <button
                onClick={() => setNewSubProjectSize(newSubProjectSize + 1)}
                className="w-6 h-6 text-gray-500 hover:text-gray-700"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddSubProject}
              disabled={!newSubProjectName.trim()}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Compact layout for sidebar mode - collapsible
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white/80 rounded-xl border border-gray-200/60 overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-3 py-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-black/[0.02] transition-colors"
        onClick={() => toggleProjectCollapse(project.id)}
      >
        <motion.div
          animate={{ rotate: project.isCollapsed ? -90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-black/10 hover:scale-110 transition-transform"
            style={{ backgroundColor: project.color }}
          />
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-6 left-0 z-[100] bg-white rounded-xl shadow-apple-xl border border-gray-200/80 p-2.5 grid grid-cols-5 gap-1.5 w-[140px]"
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
                    className="w-5 h-5 rounded-full hover:scale-110 transition-transform ring-1 ring-black/10"
                    style={{ backgroundColor: color }}
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
          className="flex-1 min-w-0 font-medium text-sm text-gray-900 bg-transparent border-none outline-none focus:ring-1 focus:ring-violet-500/30 rounded px-1 -mx-1 truncate"
        />

        <span className="text-[11px] text-gray-400 tabular-nums flex-shrink-0">
          {allocatedSize}/{totalSize}m
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this project?')) {
              removeProject(project.id);
            }
          }}
          className="text-gray-300 hover:text-red-500 transition-colors p-0.5 -mr-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {!project.isCollapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-gray-100">
              {/* Sub-projects */}
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[32px]">
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
                  <span className="text-gray-300 text-xs py-1">No sub-projects</span>
                )}
              </div>

              {/* Add sub-project form */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSubProjectName}
                  onChange={(e) => setNewSubProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubProject()}
                  placeholder="Add task..."
                  className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-gray-100/80 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-white transition-all placeholder:text-gray-400"
                />
                <div className="flex items-center bg-gray-100/80 rounded-md">
                  <button
                    onClick={() => setNewSubProjectSize(Math.max(1, newSubProjectSize - 1))}
                    className="w-6 h-7 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    -
                  </button>
                  <span className="text-xs w-4 text-center text-gray-600 tabular-nums">{newSubProjectSize}</span>
                  <button
                    onClick={() => setNewSubProjectSize(newSubProjectSize + 1)}
                    className="w-6 h-7 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddSubProject}
                  disabled={!newSubProjectName.trim()}
                  className="px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
