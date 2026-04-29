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
  onToggleDone: () => void;
}

export function SubProjectChip({
  projectId,
  subProject,
  color,
  onRemove,
  onUpdateSize,
  onUpdateName,
  onToggleDone,
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
  const isDone = !!subProject.done;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: isDragging ? 0.5 : 1 }}
      className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg text-white text-xs font-medium cursor-grab active:cursor-grabbing transition-all ${
        isDone ? 'opacity-50 saturate-50' : isAssigned ? 'opacity-35 saturate-50' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'
      }`}
      style={{ ...style, backgroundColor: color }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        title={isDone ? 'Mark as not done' : 'Mark as done'}
        className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
          isDone ? 'bg-white/90 text-gray-800' : 'bg-black/15 hover:bg-white/30 text-white/70 hover:text-white'
        }`}
      >
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
        </svg>
      </button>
      <input
        type="text"
        value={subProject.name}
        onChange={(e) => onUpdateName(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="Name..."
        className={`bg-transparent border-none outline-none min-w-[40px] max-w-[80px] text-white placeholder-white/50 text-xs ${isDone ? 'line-through' : ''}`}
      />
      <div className="flex items-center gap-0.5 bg-black/15 rounded-md px-1 py-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateSize(Math.max(1, subProject.size - 1));
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-white/60 hover:text-white w-3.5 h-3.5 flex items-center justify-center text-[10px]"
        >
          -
        </button>
        <span className="text-[10px] w-3 text-center tabular-nums">{subProject.size}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateSize(subProject.size + 1);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-white/60 hover:text-white w-3.5 h-3.5 flex items-center justify-center text-[10px]"
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
        className="text-white/50 hover:text-white hover:bg-white/20 rounded-md p-0.5 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}
