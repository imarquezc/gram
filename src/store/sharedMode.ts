// Tracks which shared plan (if any) this page is bound to.
// Kept in its own module so the store can consult it without importing the sync engine.

const PLAN_PARAM = 'p';

let sharedPlanId: string | null = readPlanIdFromUrl();

function readPlanIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const id = new URLSearchParams(window.location.search).get(PLAN_PARAM);
  return id && /^[A-Za-z0-9]{8,32}$/.test(id) ? id : null;
}

export const getSharedPlanId = () => sharedPlanId;
export const isSharedMode = () => sharedPlanId !== null;

export function setSharedPlanId(id: string | null) {
  sharedPlanId = id;
  const url = new URL(window.location.href);
  if (id) url.searchParams.set(PLAN_PARAM, id);
  else url.searchParams.delete(PLAN_PARAM);
  window.history.replaceState(null, '', url);
}

export const getSharedPlanUrl = () => window.location.href;
