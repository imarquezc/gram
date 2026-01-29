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
}

export function PlacedBlock({ project, subProject, onRemove }: PlacedBlockProps) {
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

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    backgroundColor: getColorHex(project.color),
    opacity: isDragging ? 0.5 : 1,
  };

  const fullText = `${subProject.name} - ${project.name} (${subProject.size} month${subProject.size > 1 ? 's' : ''})`;

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
      {/* Subtle top highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <div
        ref={contentRef}
        className="h-full flex flex-col justify-center px-2 py-0.5 text-white pointer-events-none overflow-hidden relative"
      >
        <div className="flex items-center gap-1">
          <span className="truncate flex-1 min-w-0 text-[11px] font-medium leading-tight">{subProject.name}</span>
          {size >= 2 && (
            <span className="text-[9px] opacity-70 flex-shrink-0 tabular-nums">{subProject.size}m</span>
          )}
        </div>
        {showProjectName && (
          <div className="text-[9px] opacity-50 truncate leading-tight">{project.name}</div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute top-0 right-0 w-4 h-4 bg-black/30 hover:bg-red-500 text-white rounded-bl-md rounded-tr-md opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-[10px] pointer-events-auto"
      >
        ×
      </button>
    </motion.div>
  );
}
