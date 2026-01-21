import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Project, SubProject, MonthCapacity } from '../types';

export const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7', // purple
  '#f43f5e', // rose
  '#22c55e', // green
  '#eab308', // yellow
  '#0ea5e9', // sky
  '#d946ef', // fuchsia
  '#64748b', // slate
  '#78716c', // stone
  '#facc15', // bright yellow
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

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
          color: getRandomColor(),
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
    }
  )
);
