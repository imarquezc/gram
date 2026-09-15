import type { PlanData } from '../store/useStore';

// Same-origin by default (the Worker serves both the app and the API).
// Set VITE_API_BASE at build time if the app is hosted elsewhere.
const API_BASE: string = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

export class PlanNotFoundError extends Error {
  constructor(id: string) {
    super(`Plan ${id} not found`);
    this.name = 'PlanNotFoundError';
  }
}

export interface RemotePlan {
  data: PlanData;
  updatedAt: number;
}

const planUrl = (id: string) => `${API_BASE}/api/plans/${id}`;

/** Returns null when the server reports the plan is unchanged (304). */
export async function fetchPlan(id: string, knownUpdatedAt?: number): Promise<RemotePlan | null> {
  const headers: Record<string, string> = {};
  if (knownUpdatedAt !== undefined) headers['If-None-Match'] = `"${knownUpdatedAt}"`;

  const res = await fetch(planUrl(id), { headers, cache: 'no-store' });
  if (res.status === 304) return null;
  if (res.status === 404) throw new PlanNotFoundError(id);
  if (!res.ok) throw new Error(`Failed to load plan (${res.status})`);
  return (await res.json()) as RemotePlan;
}

export async function savePlan(id: string, data: PlanData): Promise<number> {
  const res = await fetch(planUrl(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    // Lets a save started right before the tab closes complete.
    keepalive: true,
  });
  if (!res.ok) throw new Error(`Failed to save plan (${res.status})`);
  const { updatedAt } = (await res.json()) as { updatedAt: number };
  return updatedAt;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** 12 base62 chars ≈ 71 bits of entropy. The id is the only "credential" for a plan. */
export function newPlanId(length = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}
