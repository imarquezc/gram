import { useStore } from '../store/useStore';

interface HeaderProps {
  layoutMode: 'side' | 'bottom';
  onLayoutToggle: () => void;
}

export function Header({ layoutMode, onLayoutToggle }: HeaderProps) {
  const getTotalWork = useStore((s) => s.getTotalWork);
  const getTotalAllocated = useStore((s) => s.getTotalAllocated);
  const getTotalCapacity = useStore((s) => s.getTotalCapacity);

  const work = getTotalWork();
  const allocated = getTotalAllocated();
  const capacity = getTotalCapacity();
  const unallocated = work - allocated;

  return (
    <header className="glass-dark border-b border-white/10 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A8DF8E] to-[#7CB87C] flex items-center justify-center shadow-lg shadow-[#A8DF8E]/25">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Gram</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MetricPill label="Total Work" value={work} variant="neutral" />
            <MetricPill label="Allocated" value={allocated} variant="success" />
            <MetricPill label="Unallocated" value={unallocated} variant={unallocated > 0 ? 'warning' : 'neutral'} />
            <MetricPill label="Capacity" value={capacity} variant="info" />
          </div>

          {/* Layout Toggle Button */}
          <button
            onClick={onLayoutToggle}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-all"
            title={layoutMode === 'side' ? 'Switch to bottom layout' : 'Switch to side layout'}
          >
            {layoutMode === 'side' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5h16M4 10h16M4 15h8M4 20h8" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4v16M4 4h16v16H4z" />
              </svg>
            )}
            {layoutMode === 'side' ? 'Bottom' : 'Side'}
          </button>
        </div>
      </div>
    </header>
  );
}

interface MetricPillProps {
  label: string;
  value: number;
  variant: 'neutral' | 'success' | 'warning' | 'info';
}

function MetricPill({ label, value, variant }: MetricPillProps) {
  const colors = {
    neutral: 'bg-white/10 text-white/90',
    success: 'bg-[#A8DF8E]/25 text-[#A8DF8E]',
    warning: 'bg-[#FFAAB8]/25 text-[#FFAAB8]',
    info: 'bg-[#A8DF8E]/15 text-[#c8f0b8]',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full">
      <span className="text-white/50 text-xs font-medium">{label}</span>
      <span className={`text-sm font-semibold tabular-nums px-2 py-0.5 rounded-md ${colors[variant]}`}>
        {value}
      </span>
    </div>
  );
}
