import { create } from 'zustand';
import { useStore, getPlanData, applyPlanData } from './useStore';
import { getSharedPlanId, setSharedPlanId, getSharedPlanUrl } from './sharedMode';
import { fetchPlan, savePlan, newPlanId, PlanNotFoundError } from '../lib/planApi';

export type SyncStatus = 'local' | 'loading' | 'saving' | 'saved' | 'error';

interface SharedPlanState {
  planId: string | null;
  status: SyncStatus;
  message: string | null; // human-readable detail for 'error'
  toast: string | null; // transient feedback ("Link copied")
}

export const useSharedPlan = create<SharedPlanState>(() => ({
  planId: getSharedPlanId(),
  status: getSharedPlanId() ? 'loading' : 'local',
  message: null,
  toast: null,
}));

const setStatus = (status: SyncStatus, message: string | null = null) =>
  useSharedPlan.setState({ status, message });

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function showToast(toast: string, ms = 2000) {
  clearTimeout(toastTimer);
  useSharedPlan.setState({ toast });
  toastTimer = setTimeout(() => useSharedPlan.setState({ toast: null }), ms);
}

const SAVE_DEBOUNCE_MS = 600;
const POLL_INTERVAL_MS = 10_000;

// --- Sync engine (module singletons; one shared plan per page) ---

let lastKnownUpdatedAt: number | undefined;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let saveInFlight = false;
let saveQueued = false;
let dirty = false;
let applyingRemote = false;
let started = false;

function scheduleSave() {
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
}

async function flushSave() {
  clearTimeout(saveTimer);
  const id = getSharedPlanId();
  if (!id || !dirty) return;
  if (saveInFlight) {
    saveQueued = true;
    return;
  }

  saveInFlight = true;
  dirty = false;
  setStatus('saving');
  try {
    lastKnownUpdatedAt = await savePlan(id, getPlanData(useStore.getState()));
    setStatus('saved');
  } catch (err) {
    dirty = true;
    setStatus('error', 'Save failed. Check your connection.');
    console.error(err);
  } finally {
    saveInFlight = false;
    if (saveQueued) {
      saveQueued = false;
      void flushSave();
    }
  }
}

async function pullRemote() {
  const id = getSharedPlanId();
  // Never clobber edits that haven't reached the server yet
  if (!id || dirty || saveInFlight) return;
  try {
    const remote = await fetchPlan(id, lastKnownUpdatedAt);
    if (!remote || dirty || saveInFlight) return;
    if (lastKnownUpdatedAt !== undefined && remote.updatedAt <= lastKnownUpdatedAt) return;

    lastKnownUpdatedAt = remote.updatedAt;
    applyingRemote = true;
    try {
      applyPlanData(remote.data);
    } finally {
      applyingRemote = false;
    }
    if (useSharedPlan.getState().status === 'error') setStatus('saved');
  } catch (err) {
    console.warn('Could not refresh shared plan', err);
  }
}

/** Wires autosave + polling. Safe to call once the store holds the plan's current data. */
function startSync() {
  if (started) return;
  started = true;

  useStore.subscribe((state, prev) => {
    if (applyingRemote) return;
    if (
      state.projects === prev.projects &&
      state.monthCapacities === prev.monthCapacities &&
      state.activePalette === prev.activePalette
    ) {
      return;
    }
    scheduleSave();
  });

  setInterval(() => {
    if (document.visibilityState === 'visible') void pullRemote();
  }, POLL_INTERVAL_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void pullRemote();
    else void flushSave();
  });
  window.addEventListener('pagehide', () => void flushSave());
}

/** Call once at startup. Loads the plan from the URL (if any) and starts syncing. */
export async function initSharedPlan() {
  const id = getSharedPlanId();
  if (!id) return;

  try {
    const remote = await fetchPlan(id);
    if (!remote) throw new Error('Unexpected empty response');
    lastKnownUpdatedAt = remote.updatedAt;
    applyingRemote = true;
    try {
      applyPlanData(remote.data);
    } finally {
      applyingRemote = false;
    }
    setStatus('saved');
    startSync();
  } catch (err) {
    if (err instanceof PlanNotFoundError) {
      // Bad link: fall back to the local plan
      setSharedPlanId(null);
      await useStore.persist.rehydrate();
      useSharedPlan.setState({ planId: null, status: 'local', message: null });
      showToast('Shared plan not found. Showing your local plan.', 4000);
    } else {
      setStatus('error', 'Could not load the shared plan. Reload to retry.');
      console.error(err);
    }
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Publishes the current local plan to a new shared id and copies its link. */
export async function startSharing() {
  if (getSharedPlanId()) return copyShareLink();

  const id = newPlanId();
  setStatus('saving');
  try {
    lastKnownUpdatedAt = await savePlan(id, getPlanData(useStore.getState()));
  } catch (err) {
    setStatus('error', 'Could not create the shared plan.');
    console.error(err);
    return;
  }

  setSharedPlanId(id);
  useSharedPlan.setState({ planId: id, status: 'saved', message: null });
  startSync();
  await copyShareLink();
}

export async function copyShareLink() {
  const ok = await copyToClipboard(getSharedPlanUrl());
  showToast(ok ? 'Link copied' : 'Copy the link from the address bar');
}
