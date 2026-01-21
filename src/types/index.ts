export interface SubProject {
  id: string;
  name: string;
  size: number; // dev-months - this determines how many months it spans
  startMonth: number | null; // 0-11 for Jan-Dec, null if unassigned (starting month)
  row: number | null; // which row in the grid (0-indexed)
}

export interface Project {
  id: string;
  name: string;
  color: string;
  subProjects: SubProject[];
  isCollapsed: boolean;
}

export interface MonthCapacity {
  month: number; // 0-11
  capacity: number; // dev-months available (number of rows)
}

export interface AppState {
  projects: Project[];
  monthCapacities: MonthCapacity[];

  // Actions
  addProject: (name: string) => void;
  removeProject: (projectId: string) => void;
  updateProjectName: (projectId: string, name: string) => void;
  updateProjectColor: (projectId: string, color: string) => void;
  toggleProjectCollapse: (projectId: string) => void;

  addSubProject: (projectId: string, name: string, size: number) => void;
  removeSubProject: (projectId: string, subProjectId: string) => void;
  updateSubProject: (projectId: string, subProjectId: string, updates: Partial<SubProject>) => void;

  assignSubProject: (projectId: string, subProjectId: string, startMonth: number, row: number) => void;
  unassignSubProject: (projectId: string, subProjectId: string) => void;

  updateMonthCapacity: (month: number, capacity: number) => void;

  // Computed
  getTotalCapacity: () => number;
  getTotalAllocated: () => number;
  getTotalWork: () => number;
  getMonthAllocated: (month: number) => number;
  getAllAssignedSubProjects: () => Array<{ project: Project; subProject: SubProject }>;
  isSlotOccupied: (month: number, row: number) => boolean;
  findAvailableRow: (startMonth: number, size: number) => number | null;
}
