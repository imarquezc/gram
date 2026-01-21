import { useStore } from '../store/useStore';

export function Header() {
  const getTotalWork = useStore((s) => s.getTotalWork);
  const getTotalAllocated = useStore((s) => s.getTotalAllocated);
  const getTotalCapacity = useStore((s) => s.getTotalCapacity);

  const work = getTotalWork();
  const allocated = getTotalAllocated();
  const capacity = getTotalCapacity();
  const unallocated = work - allocated;

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 shadow-lg">
      <div className="max-w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Gram</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Total Work</span>
            <span className="bg-slate-700 px-3 py-1 rounded-lg font-semibold">{work}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Allocated</span>
            <span className="bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-lg font-semibold">{allocated}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Unallocated</span>
            <span className={`px-3 py-1 rounded-lg font-semibold ${unallocated > 0 ? 'bg-amber-600/20 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>
              {unallocated}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Capacity</span>
            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg font-semibold">{capacity}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
