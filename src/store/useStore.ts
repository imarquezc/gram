import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Project, SubProject, MonthCapacity } from '../types';

// Color palette with semantic keys - actual colors can change freely
// Professional palette - muted, harmonious, no browns
export const COLOR_PALETTE: Record<string, string> = {
  // Row 1: Core
  'c1': '#5E8B5A',   // Sage
  'c2': '#7BAE7F',   // Fern
  'c3': '#C96B6B',   // Dusty rose
  'c4': '#D4956A',   // Apricot
  'c5': '#6B8CAE',   // Steel blue
  // Row 2: Cool accents
  'c1-m': '#4A7A8C', // Teal
  'c2-m': '#5B7A9E', // Slate blue
  'c3-m': '#9B6B8C', // Mauve
  'c4-m': '#7A8B6B', // Olive
  'c5-m': '#6B6B9B', // Periwinkle
  // Row 3: Soft tones
  'c1-s': '#6B8B8B', // Slate teal
  'c2-s': '#7B9B8B', // Sea foam
  'c3-s': '#9B7B8B', // Dusty plum
  'c4-s': '#7B8B9B', // Cool slate
  'c5-s': '#8B7B9B', // Soft violet
  // Row 4: Neutrals
  'n1': '#2D3748',   // Charcoal
  'n2': '#4A5568',   // Dark gray
  'n3': '#606770',   // Medium gray
  'n4': '#718096',   // Gray
  'n5': '#A0AEC0',   // Light gray
};

// Ordered list of color keys for the picker (matches grid layout)
export const COLOR_KEYS = Object.keys(COLOR_PALETTE);

// Get hex value from color key (supports both keys and legacy hex values)
export const getColorHex = (color: string): string => {
  // If it's already a hex value, return it
  if (color.startsWith('#')) return color;
  // Otherwise look up the key
  return COLOR_PALETTE[color] || COLOR_PALETTE['c1'];
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
    }
  )
);
