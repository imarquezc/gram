import { useStore, PALETTES, getActivePalette } from '../store/useStore';

interface HeaderProps {
  layoutMode: 'side' | 'bottom';
  onLayoutToggle: () => void;
}

export function Header({ layoutMode, onLayoutToggle }: HeaderProps) {
  const cyclePalette = useStore((s) => s.cyclePalette);
  const activePalette = useStore((s) => s.activePalette);

  return (
    <header className="glass-dark border-b border-white/10 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A8DF8E] to-[#7CB87C] flex items-center justify-center shadow-lg shadow-[#A8DF8E]/25">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-white tracking-tight">Gram</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Palette Switcher */}
          <button
            onClick={cyclePalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-all"
            title="Switch color palette"
          >
            <div className="flex -space-x-1">
              {['c1', 'c2', 'c3'].map((key) => (
                <div
                  key={key}
                  className="w-3 h-3 rounded-full ring-1 ring-white/30"
                  style={{ backgroundColor: PALETTES[getActivePalette()].colors[key] }}
                />
              ))}
            </div>
            <span>{PALETTES[activePalette].name}</span>
          </button>

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
