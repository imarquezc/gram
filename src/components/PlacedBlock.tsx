import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { Project, SubProject } from '../types';

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

  const startMonth = subProject.startMonth!;
  const size = subProject.size;
  const leftPercent = (startMonth / 12) * 100;
  const widthPercent = (size / 12) * 100;

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    backgroundColor: project.color,
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
      className="absolute top-1 bottom-1 rounded-lg shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow group overflow-hidden"
      style={style}
      title={fullText}
    >
      <div className="h-full flex flex-col justify-center px-2 text-white pointer-events-none overflow-hidden">
        <div className="flex items-center gap-1">
          <span className="truncate flex-1 min-w-0 text-sm font-medium">{subProject.name}</span>
          {size >= 2 && (
            <span className="text-xs opacity-80 flex-shrink-0">({subProject.size})</span>
          )}
        </div>
        <div className="text-[10px] italic opacity-60 truncate">{project.name}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-md pointer-events-auto"
      >
        ×
      </button>
    </motion.div>
  );
}
