import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useRef, useState, useLayoutEffect } from 'react';
import type { Project, SubProject } from '../types';
import { getColorHex } from '../store/useStore';

interface PlacedBlockProps {
  project: Project;
  subProject: SubProject;
  onRemove: () => void;
  onToggleDone: () => void;
}

export function PlacedBlock({ project, subProject, onRemove, onToggleDone }: PlacedBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `placed-${subProject.id}`,
    data: {
      projectId: project.id,
      subProject,
      isPlaced: true,
    },
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [showProjectName, setShowProjectName] = useState(false);

  useLayoutEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const height = contentRef.current.clientHeight;
        setShowProjectName(height >= 34);
      }
    };

    checkHeight();

    const resizeObserver = new ResizeObserver(checkHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const startMonth = subProject.startMonth!;
  const size = subProject.size;
  const leftPercent = (startMonth / 12) * 100;
  const widthPercent = (size / 12) * 100;

  const isDone = !!subProject.done;

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    backgroundColor: isDone ? '#F3F4F6' : getColorHex(project.color),
    backgroundImage: isDone
      ? 'repeating-linear-gradient(135deg, transparent 0 6px, rgba(0,0,0,0.04) 6px 7px)'
      : undefined,
    border: isDone ? '1px dashed #D1D5DB' : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const fullText = `${subProject.name} - ${project.name} (${subProject.size} month${subProject.size > 1 ? 's' : ''})${isDone ? ' — done' : ''}`;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: isDragging ? 0.5 : 1 }}
      className="absolute top-0.5 bottom-0.5 rounded-md cursor-grab active:cursor-grabbing group overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={style}
      title={fullText}
    >
      {/* Subtle top highlight (only when not done) */}
      {!isDone && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      )}

      <div
        ref={contentRef}
        className={`h-full flex flex-col justify-center px-2 py-0.5 pointer-events-none overflow-hidden relative ${isDone ? 'text-gray-500' : 'text-white'}`}
      >
        <div className="flex items-center gap-1">
          {isDone && (
            <svg className="w-2.5 h-2.5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className={`truncate flex-1 min-w-0 text-[11px] font-medium leading-tight ${isDone ? 'line-through' : ''}`}>{subProject.name}</span>
          {size >= 2 && (
            <span className={`text-[9px] flex-shrink-0 tabular-nums ${isDone ? 'opacity-60' : 'opacity-70'}`}>{subProject.size}m</span>
          )}
        </div>
        {showProjectName && (
          <div className={`text-[9px] truncate leading-tight ${isDone ? 'opacity-50' : 'opacity-50'}`}>{project.name}</div>
        )}
      </div>

      <div className="absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-all pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title={isDone ? 'Mark as not done' : 'Mark as done'}
          className={`w-4 h-4 ${isDone ? 'bg-emerald-500/80 hover:bg-emerald-600' : 'bg-black/30 hover:bg-emerald-500'} text-white flex items-center justify-center transition-colors`}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-4 h-4 bg-black/30 hover:bg-red-500 text-white rounded-bl-md rounded-tr-md flex items-center justify-center text-[10px]"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
