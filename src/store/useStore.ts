import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Project, SubProject, MonthCapacity } from '../types';

// Three color palettes with semantic keys
export type PaletteName = 'forest' | 'ocean' | 'sunset';

export const PALETTES: Record<PaletteName, { name: string; colors: Record<string, string> }> = {
  forest: {
    name: 'Forest',
    colors: {
      'c1': '#5E8B5A', 'c2': '#7BAE7F', 'c3': '#C96B6B', 'c4': '#D4956A', 'c5': '#6B8CAE',
      'c1-m': '#4A7A8C', 'c2-m': '#5B7A9E', 'c3-m': '#9B6B8C', 'c4-m': '#7A8B6B', 'c5-m': '#6B6B9B',
      'c1-s': '#6B8B8B', 'c2-s': '#7B9B8B', 'c3-s': '#9B7B8B', 'c4-s': '#7B8B9B', 'c5-s': '#8B7B9B',
      'n1': '#2D3748', 'n2': '#4A5568', 'n3': '#606770', 'n4': '#718096', 'n5': '#A0AEC0',
    },
  },
  ocean: {
    name: 'Ocean',
    colors: {
      'c1': '#2E86AB', 'c2': '#5299D3', 'c3': '#7ECBA1', 'c4': '#45B7A0', 'c5': '#6C5B7B',
      'c1-m': '#3E92A3', 'c2-m': '#5A9EC7', 'c3-m': '#68B8C4', 'c4-m': '#4AAFB8', 'c5-m': '#7B6B8B',
      'c1-s': '#5A8A9A', 'c2-s': '#7AA3B5', 'c3-s': '#8ABBB8', 'c4-s': '#6AACAC', 'c5-s': '#8A8A9A',
      'n1': '#1A3A4A', 'n2': '#2A4A5A', 'n3': '#4A6A7A', 'n4': '#6A8A9A', 'n5': '#9AACB8',
    },
  },
  sunset: {
    name: 'Sunset',
    colors: {
      'c1': '#E07A5F', 'c2': '#F2A65A', 'c3': '#D4A373', 'c4': '#BC6C6C', 'c5': '#8B5A5A',
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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      monthCapacities: initialCapacities,
      activePalette: 'forest' as PaletteName,

      cyclePalette: () => {
        const current = get().activePalette;
        const currentIndex = PALETTE_NAMES.indexOf(current);
        const nextIndex = (currentIndex + 1) % PALETTE_NAMES.length;
        const next = PALETTE_NAMES[nextIndex];
        setActivePalette(next);
        set({ activePalette: next });
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
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state?.activePalette) {
          setActivePalette(state.activePalette);
        }
      },
    }
  )
);
