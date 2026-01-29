# Gram - Capacity Planning App

## What is Gram?

Gram is a visual capacity planning tool for scheduling development work across a 12-month timeline. Users create projects with sub-projects (tasks), each sized in "dev-months", and drag them onto a timeline grid to plan resource allocation.

## Core Concepts

- **Project**: A container with a name, color, and multiple sub-projects
- **Sub-project**: A task with a name and size (in dev-months). Can be dragged to the timeline
- **Timeline**: A 12-month grid where sub-projects are placed. Each month has configurable capacity (number of rows)
- **Dev-month**: Unit of work measurement. A sub-project of size 3 spans 3 months on the timeline
- **Capacity**: Per-month limit on how many concurrent tasks can run (adjustable with +/- buttons)

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Zustand** for state management (persisted to localStorage)
- **@dnd-kit** for drag-and-drop functionality
- **Framer Motion** for animations
- **Tailwind CSS 4** for styling (Apple-inspired glassmorphism design)

## Key Files

```
src/
├── App.tsx                 # Main app, DnD context, layout switching, resize logic
├── store/useStore.ts       # Zustand store with all state and actions
├── types/index.ts          # TypeScript interfaces
├── index.css               # Global styles, glass effects, Apple-style shadows
└── components/
    ├── Header.tsx          # Top bar with metrics (work, allocated, capacity)
    ├── CapacityGrid.tsx    # Timeline grid with month headers and droppable cells
    ├── PlacedBlock.tsx     # Sub-project block placed on timeline (draggable)
    ├── ProjectsPanel.tsx   # Sidebar/bottom panel containing project cards
    ├── ProjectCard.tsx     # Expandable project with sub-projects list
    └── SubProjectChip.tsx  # Draggable chip for unassigned sub-projects
```

## State Structure (Zustand)

```typescript
interface AppState {
  projects: Project[];           // All projects with their sub-projects
  monthCapacities: MonthCapacity[]; // Capacity per month (0-11)

  // Actions for CRUD on projects/sub-projects
  // Assignment actions for placing sub-projects on timeline
  // Computed getters for totals and slot availability
}
```

## Features

1. **Drag & Drop**: Drag sub-projects from the projects panel onto timeline cells
2. **Layout Toggle**: Switch between side (sidebar) and bottom panel layouts
3. **Timeline Resize**: Drag handle to resize timeline height; rows stretch/compress
4. **Capacity Adjustment**: +/- buttons per month to set available slots
5. **Visual Feedback**: Over-capacity rows shown in red, drop targets highlight on hover
6. **Persistence**: All data saved to localStorage (`gram-storage`, `gram-layout`, `gram-timeline-height`)

## UI Patterns

- **Glassmorphism**: Semi-transparent panels with backdrop blur
- **Apple-style shadows**: Layered, soft shadows (`shadow-apple`, `shadow-apple-lg`)
- **Responsive blocks**: Timeline blocks show/hide project name based on available height
- **Color coding**: Each project has a color; sub-projects and timeline blocks inherit it

## Common Tasks

- **Add project**: Type name in input, click Add
- **Add sub-project**: Expand project card, type name, set size with +/-, click Add
- **Schedule work**: Drag sub-project chip to a timeline cell
- **Reschedule**: Drag placed block to new position
- **Remove from timeline**: Hover block, click X button
- **Adjust capacity**: Use +/- under month headers
