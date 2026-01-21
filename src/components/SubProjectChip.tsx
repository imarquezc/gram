import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { SubProject } from '../types';

interface SubProjectChipProps {
  projectId: string;
  subProject: SubProject;
  color: string;
  onRemove: () => void;
  onUpdateSize: (size: number) => void;
  onUpdateName: (name: string) => void;
}

export function SubProjectChip({
  projectId,
  subProject,
  color,
  onRemove,
  onUpdateSize,
  onUpdateName,
}: SubProjectChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: subProject.id,
    data: {
      projectId,
      subProject,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const isAssigned = subProject.startMonth !== null;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: isDragging ? 0.5 : 1 }}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
        isAssigned ? 'opacity-40' : ''
      }`}
      style={{ ...style, backgroundColor: color }}
    >
      <input
        type="text"
        value={subProject.name}
        onChange={(e) => onUpdateName(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="Name..."
        className="bg-transparent border-none outline-none min-w-[60px] max-w-[120px] text-white placeholder-white/50"
      />
      <div className="flex items-center gap-1 bg-black/20 rounded px-2 py-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateSize(Math.max(1, subProject.size - 1));
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-white/70 hover:text-white w-4 h-4 flex items-center justify-center"
        >
          -
        </button>
        <span className="text-xs w-4 text-center">{subProject.size}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateSize(subProject.size + 1);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-white/70 hover:text-white w-4 h-4 flex items-center justify-center"
        >
          +
        </button>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="text-white/70 hover:text-white ml-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}
