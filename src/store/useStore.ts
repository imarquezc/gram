import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Project, SubProject, MonthCapacity, YearPlan } from '../types';
import { isSharedMode } from './sharedMode';

// Three color palettes with semantic keys
export type PaletteName = 'forest' | 'ocean' | 'sunset';

export const PALETTES: Record<PaletteName, { name: string; colors: Record<string, string> }> = {
  forest: {
    name: 'Forest',
    colors: {
      'c1': '#5E8B5A', 'c2': '#7BAE7F', 'c3': '#C96B6B', 'c4': '#D4956A', 'c5': '#6B8CAE',
      'c1-x': '#8466B8', 'c2-x': '#C0628C', 'c3-x': '#A8872A', 'c4-x': '#2F8F86', 'c5-x': '#8B5E3C',
      'c1-y': '#34508F', 'c2-y': '#8F3B4A', 'c3-y': '#6B8A26', 'c4-y': '#C4652F', 'c5-y': '#5A3E8C',
      'c1-m': '#4A7A8C', 'c2-m': '#5B7A9E', 'c3-m': '#9B6B8C', 'c4-m': '#7A8B6B', 'c5-m': '#6B6B9B',
      'c1-s': '#6B8B8B', 'c2-s': '#7B9B8B', 'c3-s': '#9B7B8B', 'c4-s': '#7B8B9B', 'c5-s': '#8B7B9B',
      'n1': '#2D3748', 'n2': '#4A5568', 'n3': '#606770', 'n4': '#718096', 'n5': '#A0AEC0',
    },
  },
  ocean: {
    name: 'Ocean',
    colors: {
      'c1': '#2E86AB', 'c2': '#5299D3', 'c3': '#7ECBA1', 'c4': '#45B7A0', 'c5': '#6C5B7B',
      'c1-x': '#7B61C9', 'c2-x': '#C8609B', 'c3-x': '#B08A30', 'c4-x': '#D9694F', 'c5-x': '#274C77',
      'c1-y': '#C27A1A', 'c2-y': '#9B3F6E', 'c3-y': '#6E9E3A', 'c4-y': '#A8522B', 'c5-y': '#C04A4A',
      'c1-m': '#3E92A3', 'c2-m': '#5A9EC7', 'c3-m': '#68B8C4', 'c4-m': '#4AAFB8', 'c5-m': '#7B6B8B',
      'c1-s': '#5A8A9A', 'c2-s': '#7AA3B5', 'c3-s': '#8ABBB8', 'c4-s': '#6AACAC', 'c5-s': '#8A8A9A',
      'n1': '#1A3A4A', 'n2': '#2A4A5A', 'n3': '#4A6A7A', 'n4': '#6A8A9A', 'n5': '#9AACB8',
    },
  },
  sunset: {
    name: 'Sunset',
    colors: {
      'c1': '#E07A5F', 'c2': '#F2A65A', 'c3': '#D4A373', 'c4': '#BC6C6C', 'c5': '#8B5A5A',
      'c1-x': '#7E4E8C', 'c2-x': '#3F8F8A', 'c3-x': '#4F74A8', 'c4-x': '#7D8B3A', 'c5-x': '#C8577A',
      'c1-y': '#2F4A6B', 'c2-y': '#4E8A5B', 'c3-y': '#B08A1E', 'c4-y': '#9A6BC0', 'c5-y': '#7A2E3A',
      'c1-m': '#C97A6B', 'c2-m': '#E0956A', 'c3-m': '#C9A07A', 'c4-m': '#A86B6B', 'c5-m': '#9A6B7B',
      'c1-s': '#B08A7A', 'c2-s': '#C9A88A', 'c3-s': '#BDA08A', 'c4-s': '#9A7A7A', 'c5-s': '#8A7A8A',
      'n1': '#3D2C2C', 'n2': '#5A4545', 'n3': '#7A6565', 'n4': '#9A8585', 'n5': '#B8A8A8',
    },
  },
};

export const PALETTE_NAMES: PaletteName[] = ['forest', 'ocean', 'sunset'];

// Ordered list of color keys for the picker
export const COLOR_KEYS = Object.keys(PALETTES.forest.colors);

// Active palette stored outside Zustand for sync access (also persisted in store)
let activePalette: PaletteName = 'forest';

export const setActivePalette = (name: PaletteName) => {
  activePalette = name;
};

export const getActivePalette = () => activePalette;

// Get hex value from color key (supports both keys and legacy hex values)
export const getColorHex = (color: string): string => {
  if (color.startsWith('#')) return color;
  return PALETTES[activePalette].colors[color] || PALETTES[activePalette].colors['c1'];
};

const getRandomColorKey = () => {
  const mainColors = ['c1', 'c2', 'c3', 'c4', 'c5'];
  return mainColors[Math.floor(Math.random() * mainColors.length)];
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getMonthName = (month: number) => MONTHS[month];

const initialCapacities: MonthCapacity[] = Array.from({ length: 12 }, (_, i) => ({
  month: i,
  capacity: 5,
}));

// The slice of state that gets persisted (locally or to a shared plan)
export interface PlanData {
  years: Record<string, YearPlan>;
  activePalette: PaletteName;
}

export const getPlanData = (state: AppState): PlanData => ({
  years: {
    ...state.otherYears,
    [state.activeYear]: { projects: state.projects, monthCapacities: state.monthCapacities },
  },
  activePalette: state.activePalette,
});

// Plans saved before multi-year support hold a single year at the top level.
// They were all made while the timeline implicitly meant 2026.
const LEGACY_PLAN_YEAR = 2026;

const normalizeYearPlan = (plan: Partial<YearPlan> | undefined): YearPlan => ({
  projects: Array.isArray(plan?.projects) ? plan.projects : [],
  monthCapacities: plan?.monthCapacities?.length === 12 ? plan.monthCapacities : initialCapacities,
});

/** Accepts current and legacy plan formats (from localStorage or a shared plan). */
export const normalizePlanData = (raw: unknown): PlanData => {
  const data = (raw ?? {}) as Partial<PlanData> & Partial<YearPlan>;
  const source =
    data.years && typeof data.years === 'object'
      ? data.years
      : { [LEGACY_PLAN_YEAR]: { projects: data.projects, monthCapacities: data.monthCapacities } };
  const years = Object.fromEntries(
    Object.entries(source)
      .filter(([year]) => /^\d{4}$/.test(year))
      .map(([year, plan]) => [year, normalizeYearPlan(plan)])
  );
  const palette = data.activePalette && PALETTE_NAMES.includes(data.activePalette) ? data.activePalette : 'forest';
  return { years, activePalette: palette };
};

const sortedYears = (years: Iterable<string | number>) => [...new Set([...years].map(Number))].sort((a, b) => a - b);

// The viewed year is a per-browser preference, never part of the (possibly shared) plan
const YEAR_KEY = 'gram-year';

const getStoredYear = (): number | null => {
  const year = parseInt(localStorage.getItem(YEAR_KEY) ?? '', 10);
  return isNaN(year) ? null : year;
};

const storeYear = (year: number) => localStorage.setItem(YEAR_KEY, String(year));

// Keeps `preferred` if the plan has it; otherwise the current year, otherwise the latest one
const pickYear = (years: number[], preferred: number | null): number => {
  if (preferred !== null && years.includes(preferred)) return preferred;
  const currentYear = new Date().getFullYear();
  if (years.length === 0 || years.includes(currentYear)) return currentYear;
  return years[years.length - 1];
};

// Store state that shows `year` out of a full set of years (the year may not exist yet)
const showYear = (years: Record<string, YearPlan>, year: number) => {
  const { [year]: active, ...otherYears } = years;
  return { activeYear: year, ...normalizeYearPlan(active), otherYears };
};

// Turns plan data into store state, showing `preferredYear` when the plan has it
const unpackPlanData = (data: PlanData, preferredYear: number | null) => ({
  ...showYear(data.years, pickYear(sortedYears(Object.keys(data.years)), preferredYear)),
  activePalette: data.activePalette,
});

export const applyPlanData = (data: PlanData) => {
  const normalized = normalizePlanData(data);
  setActivePalette(normalized.activePalette);
  useStore.setState(unpackPlanData(normalized, useStore.getState().activeYear));
};

// When the page is bound to a shared plan, the server is the source of truth:
// never overwrite the user's local plan with it.
const localPlanStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    if (!isSharedMode()) localStorage.setItem(name, value);
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeYear: getStoredYear() ?? new Date().getFullYear(),
      projects: [],
      monthCapacities: initialCapacities,
      otherYears: {},
      activePalette: 'forest' as PaletteName,

      cyclePalette: () => {
        const current = get().activePalette;
        const currentIndex = PALETTE_NAMES.indexOf(current);
        const nextIndex = (currentIndex + 1) % PALETTE_NAMES.length;
        const next = PALETTE_NAMES[nextIndex];
        setActivePalette(next);
        set({ activePalette: next });
      },

      switchYear: (year: number) => {
        const state = get();
        if (year === state.activeYear) return;
        storeYear(year);
        set(showYear(getPlanData(state).years, year));
      },

      addYear: () => {
        const { years } = getPlanData(get());
        const latest = Math.max(...Object.keys(years).map(Number));
        const year = latest + 1;
        storeYear(year);
        // A new year starts empty, with the same capacities as the latest one
        const monthCapacities = years[latest].monthCapacities.map((mc) => ({ ...mc }));
        set(showYear({ ...years, [year]: { projects: [], monthCapacities } }, year));
      },

      removeYear: (year: number) => {
        const state = get();
        const years = { ...getPlanData(state).years };
        delete years[year];
        const remaining = sortedYears(Object.keys(years));
        if (remaining.length === 0) return;

        // Removing the viewed year shows the closest remaining one instead
        const next =
          year === state.activeYear
            ? remaining.reduce((best, y) => (Math.abs(y - year) < Math.abs(best - year) ? y : best))
            : state.activeYear;
        storeYear(next);
        set(showYear(years, next));
      },

      addProject: (name: string) => {
        const newProject: Project = {
          id: uuidv4(),
          name,
          color: getRandomColorKey(),
          subProjects: [],
          isCollapsed: false,
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },

      removeProject: (projectId: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        }));
      },

      updateProjectName: (projectId: string, name: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, name } : p
          ),
        }));
      },

      updateProjectColor: (projectId: string, color: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, color } : p
          ),
        }));
      },

      toggleProjectCollapse: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, isCollapsed: !p.isCollapsed } : p
          ),
        }));
      },

      addSubProject: (projectId: string, name: string, size: number) => {
        const newSubProject: SubProject = {
          id: uuidv4(),
          name,
          size,
          startMonth: null,
          row: null,
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, subProjects: [...p.subProjects, newSubProject] }
              : p
          ),
        }));
      },

      removeSubProject: (projectId: string, subProjectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  subProjects: p.subProjects.filter((sp) => sp.id !== subProjectId),
                }
              : p
          ),
        }));
      },

      updateSubProject: (projectId: string, subProjectId: string, updates: Partial<SubProject>) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  subProjects: p.subProjects.map((sp) =>
                    sp.id === subProjectId ? { ...sp, ...updates } : sp
                  ),
                }
              : p
          ),
        }));
      },

      assignSubProject: (projectId: string, subProjectId: string, startMonth: number, row: number) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  subProjects: p.subProjects.map((sp) =>
                    sp.id === subProjectId
                      ? { ...sp, startMonth, row }
                      : sp
                  ),
                }
              : p
          ),
        }));
      },

      unassignSubProject: (projectId: string, subProjectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  subProjects: p.subProjects.map((sp) =>
                    sp.id === subProjectId
                      ? { ...sp, startMonth: null, row: null }
                      : sp
                  ),
                }
              : p
          ),
        }));
      },

      updateMonthCapacity: (month: number, capacity: number) => {
        set((state) => ({
          monthCapacities: state.monthCapacities.map((mc) =>
            mc.month === month ? { ...mc, capacity } : mc
          ),
        }));
      },

      getYears: () => sortedYears([...Object.keys(get().otherYears), get().activeYear]),

      getTotalCapacity: () => {
        return get().monthCapacities.reduce((sum, mc) => sum + mc.capacity, 0);
      },

      getTotalAllocated: () => {
        return get().projects.reduce((sum, p) => {
          return (
            sum +
            p.subProjects
              .filter((sp) => sp.startMonth !== null)
              .reduce((spSum, sp) => spSum + sp.size, 0)
          );
        }, 0);
      },

      getTotalWork: () => {
        return get().projects.reduce((sum, p) => {
          return sum + p.subProjects.reduce((spSum, sp) => spSum + sp.size, 0);
        }, 0);
      },

      getMonthAllocated: (month: number) => {
        const assigned = get().getAllAssignedSubProjects();
        const occupiedRows = new Set<number>();

        assigned.forEach(({ subProject }) => {
          const start = subProject.startMonth!;
          const end = start + subProject.size - 1;

          if (month >= start && month <= end && subProject.row !== null) {
            occupiedRows.add(subProject.row);
          }
        });

        return occupiedRows.size;
      },

      getAllAssignedSubProjects: () => {
        const result: Array<{ project: Project; subProject: SubProject }> = [];
        get().projects.forEach((project) => {
          project.subProjects
            .filter((sp) => sp.startMonth !== null)
            .forEach((subProject) => {
              result.push({ project, subProject });
            });
        });
        return result;
      },

      isSlotOccupied: (month: number, row: number) => {
        const assigned = get().getAllAssignedSubProjects();

        return assigned.some(({ subProject }) => {
          if (subProject.row !== row) return false;

          const start = subProject.startMonth!;
          const end = start + subProject.size - 1;

          return month >= start && month <= end;
        });
      },

      findAvailableRow: (startMonth: number, size: number) => {
        const endMonth = startMonth + size - 1;

        // Get maximum capacity across all affected months
        const maxCapacity = Math.max(
          ...get().monthCapacities
            .filter((mc) => mc.month >= startMonth && mc.month <= endMonth)
            .map((mc) => mc.capacity)
        );

        // Try each row
        for (let row = 0; row < maxCapacity + 5; row++) {
          let isAvailable = true;

          // Check if this row is free for all months in the span
          for (let month = startMonth; month <= endMonth; month++) {
            if (get().isSlotOccupied(month, row)) {
              isAvailable = false;
              break;
            }
          }

          if (isAvailable) {
            return row;
          }
        }

        return null;
      },
    }),
    {
      name: 'gram-storage',
      version: 2, // v2: plan split by year
      storage: createJSONStorage(() => localPlanStorage),
      partialize: getPlanData,
      migrate: (persisted) => normalizePlanData(persisted),
      merge: (persisted, current) => ({ ...current, ...unpackPlanData(normalizePlanData(persisted), getStoredYear()) }),
      // In shared mode the plan is loaded from the server instead
      skipHydration: isSharedMode(),
      onRehydrateStorage: () => (state) => {
        if (state?.activePalette) {
          setActivePalette(state.activePalette);
        }
      },
    }
  )
);
