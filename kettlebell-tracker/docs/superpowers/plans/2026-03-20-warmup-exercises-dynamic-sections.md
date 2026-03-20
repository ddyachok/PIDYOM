# Warmup Exercises & Dynamic Workout Sections Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add warmup exercises as a first-class type and replace the flat exercise list in workouts with dynamic, user-configurable sections (add, rename, reorder, collapse, remove).

**Architecture:** The `Workout` type loses its flat `exercises` array and gains `sections: WorkoutSection[]`. All exercise cards adopt a PDF-style compact layout (name + cues + sets×reps + checkbox), with warmup cards being a minimal variant. A `migrateWorkout` utility handles backwards compat for both localStorage and server-hydrated workouts. Sections are stored in a new `workout_sections` DB table with `section_id` added as a nullable FK on `workout_exercises`.

**Tech Stack:** React 19, TypeScript, Zustand 5, Tailwind CSS v4, Framer Motion, @dnd-kit/core (new), Hasura GraphQL v2, Neon PostgreSQL

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/types.ts` | Modify | Add `ExerciseType`, `WarmupDefaults`, `WorkoutSection`; update `Exercise`, `Workout` |
| `src/lib/migrations.ts` | **Create** | `migrateWorkout()` utility for backwards compat |
| `src/data/exercises.ts` | Modify | Add `exerciseType` field + new warmup exercises |
| `src/data/workouts.ts` | Modify | Remove `warmup?: string` from `WorkoutTemplate` |
| `src/store/useStore.ts` | Modify | New store actions, persist `exercises`, call migration |
| `src/lib/gql/mutations.ts` | Modify | Add section mutations |
| `src/lib/gql/queries.ts` | Modify | Add `section_id` to workout exercises query |
| `src/lib/gql/sync.ts` | Modify | Update workout sync to use sections |
| `src/lib/gql/hydrate.ts` | Modify | Reconstruct sections from server data |
| `src/components/workout/ExerciseCard.tsx` | **Create** | PDF-style exercise card (collapsed + edit mode) |
| `src/components/workout/WarmupCard.tsx` | **Create** | Minimal warmup card (name + hint + sets×reps + checkbox) |
| `src/components/workout/WorkoutSection.tsx` | **Create** | Section header (collapse/rename/drag/add) + exercise list |
| `src/components/workout/AddExerciseModal.tsx` | **Create** | Add warmup exercise modal with promote-to-warmup flow |
| `src/pages/WorkoutsPage.tsx` | Modify | Wire new components, replace flat exercise list |

---

## Chunk 1: Types, Migration, Exercise Data

### Task 1: Update `src/lib/types.ts`

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add new types and update Exercise + Workout interfaces**

Replace the contents of `src/lib/types.ts` with the following changes (keep all unchanged parts):

```ts
// Add after existing type declarations (after DifficultyLevel line):
export type ExerciseType = 'main' | 'warmup';

export interface WarmupDefaults {
  sets: number;
  reps: string; // e.g. "10-15", "20 sec", "8"
  hint: string; // shown as primary cue on warmup card
}

// Update Exercise interface — add after `unlocked: boolean;`:
//   exerciseType: ExerciseType;
//   warmupDefaults?: WarmupDefaults;

// Add new interface after WorkoutExercise:
export interface WorkoutSection {
  id: string;
  name: string; // user-editable
  exercises: WorkoutExercise[];
}

// Update Workout interface:
//   Remove: exercises: WorkoutExercise[];
//   Remove: warmup?: string;
//   Add:    sections: WorkoutSection[];
```

Full updated `Exercise` interface:
```ts
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  equipment: Equipment[];
  focusAreas: FocusArea[];
  difficulty: DifficultyLevel;
  description: string;
  cues: string[];
  progressionParentId?: string;
  progressionChildren?: string[];
  unlocked: boolean;
  exerciseType: ExerciseType;
  warmupDefaults?: WarmupDefaults;
}
```

Full updated `Workout` interface:
```ts
export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  date: string;
  sections: WorkoutSection[];
  notes?: string;
  focusAreas: FocusArea[];
  equipment: Equipment[];
  durationMinutes?: number;
  completed: boolean;
  place?: string;
}
```

- [ ] **Step 2: Build to verify types compile**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | head -60
```

Expected: TypeScript errors listing all the call sites that reference `workout.exercises` or `workout.warmup` — these are the files to fix in later tasks. The types themselves should be valid.

**Note:** You will also see an error in `src/lib/gql/hydrate.ts` about a fallback `Exercise` object missing the new required `exerciseType` field. This is expected and will be fixed in Task 8 Step 6 — ignore it for now.

- [ ] **Step 3: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/lib/types.ts && git commit -m "- add ExerciseType, WarmupDefaults, WorkoutSection types; update Exercise and Workout interfaces;"
```

---

### Task 2: Create `src/lib/migrations.ts`

**Files:**
- Create: `src/lib/migrations.ts`

- [ ] **Step 1: Write the migration utility**

```ts
// src/lib/migrations.ts
import type { Workout, WorkoutSection } from './types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Migrates a workout from any historical shape to the current WorkoutSection shape.
 * Safe to call on already-migrated workouts (no-op if sections exists).
 */
export function migrateWorkout(raw: any): Workout {
  // Already migrated
  if (raw.sections && Array.isArray(raw.sections)) {
    return raw as Workout;
  }

  // Old shape: flat exercises array
  if (raw.exercises && Array.isArray(raw.exercises)) {
    const mainSection: WorkoutSection = {
      id: generateId(),
      name: 'Main',
      exercises: raw.exercises,
    };
    const { exercises, warmup, ...rest } = raw;
    return { ...rest, sections: [mainSection] } as Workout;
  }

  // No exercises at all — initialize with default sections
  const { warmup, ...rest } = raw;
  return {
    ...rest,
    sections: [
      { id: generateId(), name: 'Warmup', exercises: [] },
      { id: generateId(), name: 'Main', exercises: [] },
    ],
  } as Workout;
}
```

- [ ] **Step 2: Build to verify no errors in the new file**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | grep migrations
```

Expected: no output (no errors in migrations.ts).

- [ ] **Step 3: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/lib/migrations.ts && git commit -m "- add migrateWorkout utility for backwards compat with flat exercises array;"
```

---

### Task 3: Update exercise data and templates

**Files:**
- Modify: `src/data/exercises.ts`
- Modify: `src/data/workouts.ts`

- [ ] **Step 1: Add `exerciseType: 'main'` to all existing exercises in `src/data/exercises.ts`**

Every existing exercise object needs `exerciseType: 'main'` added. Use find-and-replace: every object that has `unlocked: true` or `unlocked: false` should get `exerciseType: 'main'` on the next line.

Also update `kb-deadlift` with warmup defaults (for use-as-warmup):
```ts
{
  id: 'kb-deadlift',
  // ...existing fields...
  unlocked: true,
  exerciseType: 'main',  // can be promoted by user
}
```

- [ ] **Step 2: Add warmup-specific exercises at the end of the EXERCISES array**

Append after the last existing exercise:
```ts
  // ===== WARMUP EXERCISES =====
  {
    id: 'shoulder-dislocates',
    name: 'Shoulder Dislocates',
    category: 'hybrid' as const,
    movementPattern: 'flow' as const,
    equipment: ['resistance_band'] as const,
    focusAreas: ['mobility'] as const,
    difficulty: 'beginner' as const,
    description: 'Shoulder mobility drill with resistance band or dowel',
    cues: ['Straight arms throughout', 'Slow and controlled motion', 'Avoid shrugging shoulders'],
    unlocked: true,
    exerciseType: 'warmup' as const,
    warmupDefaults: { sets: 2, reps: '10-15', hint: 'Straight arms, slow and controlled' },
  },
  {
    id: 'scapular-pushups',
    name: 'Scapular Push-ups',
    category: 'grind' as const,
    movementPattern: 'push' as const,
    equipment: ['bodyweight'] as const,
    focusAreas: ['strength', 'mobility'] as const,
    difficulty: 'beginner' as const,
    description: 'Scapular protraction and retraction from push-up position',
    cues: ['Arms stay straight', 'Only scapular movement', 'Forward and back'],
    unlocked: true,
    exerciseType: 'warmup' as const,
    warmupDefaults: { sets: 2, reps: '15', hint: 'Only scapular movement, arms straight' },
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'ballistic' as const,
    movementPattern: 'flow' as const,
    equipment: ['bodyweight'] as const,
    focusAreas: ['conditioning'] as const,
    difficulty: 'beginner' as const,
    description: 'Full-body warm-up movement',
    cues: ['Light pace', 'Full range of motion', 'Arms reach overhead'],
    unlocked: true,
    exerciseType: 'warmup' as const,
    warmupDefaults: { sets: 2, reps: '20', hint: 'Light pace, full range of motion' },
  },
  {
    id: 'arm-circles',
    name: 'Arm Circles',
    category: 'hybrid' as const,
    movementPattern: 'flow' as const,
    equipment: ['bodyweight'] as const,
    focusAreas: ['mobility'] as const,
    difficulty: 'beginner' as const,
    description: 'Shoulder warm-up circles in both directions',
    cues: ['Each direction', 'Gradually increase range', 'Relaxed shoulders'],
    unlocked: true,
    exerciseType: 'warmup' as const,
    warmupDefaults: { sets: 1, reps: '15', hint: 'Each direction' },
  },
  {
    id: 'hip-circles',
    name: 'Hip Circles',
    category: 'hybrid' as const,
    movementPattern: 'flow' as const,
    equipment: ['bodyweight'] as const,
    focusAreas: ['mobility'] as const,
    difficulty: 'beginner' as const,
    description: 'Hip mobility circles to warm up the hip joint',
    cues: ['Each direction', 'Hands on hips', 'Full range'],
    unlocked: true,
    exerciseType: 'warmup' as const,
    warmupDefaults: { sets: 1, reps: '10', hint: 'Each direction' },
  },
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    category: 'grind' as const,
    movementPattern: 'squat' as const,
    equipment: ['bodyweight'] as const,
    focusAreas: ['mobility', 'strength'] as const,
    difficulty: 'beginner' as const,
    description: 'Unloaded squat to warm up hips, knees and ankles',
    cues: ['Focus on depth', 'Control the descent', 'Chest tall'],
    unlocked: true,
    exerciseType: 'warmup' as const,
    warmupDefaults: { sets: 2, reps: '10', hint: 'Focus on depth and control' },
  },
```

- [ ] **Step 3: Update `src/data/workouts.ts` — remove `warmup?: string` from WorkoutTemplate interface and all 8 template objects**

Remove line 12: `warmup?: string;` from the interface.

Remove the `warmup:` property from all 8 template objects (foundation, upper-control, lower-power, power-circuit, interval-burn, athletic-flow, mobility-session, skill-builder).

- [ ] **Step 4: Build to check exercise data compiles**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | grep -E "exercises|workouts" | head -30
```

- [ ] **Step 5: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/data/exercises.ts src/data/workouts.ts && git commit -m "- add exerciseType to all exercises; add warmup-specific exercises; remove warmup string from templates;"
```

---

## Chunk 2: Store

### Task 4: Update `src/store/useStore.ts`

**Files:**
- Modify: `src/store/useStore.ts`

This is the largest store update. Work through it section by section.

- [ ] **Step 1: Add new imports and update AppState interface**

Add to imports at top:
```ts
import { WorkoutSection, ExerciseType, WarmupDefaults } from '../lib/types';
import { migrateWorkout } from '../lib/migrations';
```

Also update the sync imports — remove `syncAddExerciseToWorkout`, add `syncAddExerciseToSection`:
```ts
// In the existing sync import block, replace:
//   syncAddExerciseToWorkout,
// with:
//   syncAddExerciseToSection,
```
This import will exist after Task 7 Step 6 adds `syncAddExerciseToSection` to `sync.ts`.

Update the `AppState` interface — add these new action signatures and remove old ones:

Remove from interface:
```ts
toggleSetComplete: (workoutId: string, exerciseId: string, setId: string) => void;
updateSetData: (workoutId: string, exerciseId: string, setId: string, data: Partial<ExerciseSet>) => void;
addExerciseToWorkout: (workoutId: string, exercise: WorkoutExercise) => void;
removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => void;
addSetToExercise: (workoutId: string, exerciseId: string) => void;
```

Add to interface:
```ts
// Modified actions (now require sectionId)
toggleSetComplete: (workoutId: string, sectionId: string, exerciseId: string, setId: string) => void;
updateSetData: (workoutId: string, sectionId: string, exerciseId: string, setId: string, data: Partial<ExerciseSet>) => void;
addSetToExercise: (workoutId: string, sectionId: string, exerciseId: string) => void;

// New section actions
addExerciseToSection: (workoutId: string, sectionId: string, exercise: Exercise) => void;
removeExerciseFromSection: (workoutId: string, sectionId: string, exerciseId: string) => void;
addSection: (workoutId: string, name: string) => void;
removeSection: (workoutId: string, sectionId: string) => void;
renameSection: (workoutId: string, sectionId: string, name: string) => void;
reorderSections: (workoutId: string, orderedSectionIds: string[]) => void;

// New exercise type actions
setExerciseType: (exerciseId: string, type: ExerciseType) => void;
updateWarmupDefaults: (exerciseId: string, defaults: WarmupDefaults) => void;

// UI state
sectionCollapseState: Record<string, boolean>;
toggleSectionCollapsed: (sectionId: string) => void;
```

- [ ] **Step 2: Replace `toggleSetComplete` implementation**

Old:
```ts
toggleSetComplete: (workoutId, exerciseId, setId) => {
  const state = get();
  const workout = state.workouts.find(w => w.id === workoutId);
  const exercise = workout?.exercises.find(ex => ex.id === exerciseId);
  const setItem = exercise?.sets.find(s => s.id === setId);
  const newCompleted = !(setItem?.completed);

  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        exercises: w.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s),
          };
        }),
      };
    }),
  }));
  syncToggleSetComplete(setId, newCompleted);
},
```

New:
```ts
toggleSetComplete: (workoutId, sectionId, exerciseId, setId) => {
  const state = get();
  const workout = state.workouts.find(w => w.id === workoutId);
  const section = workout?.sections.find(s => s.id === sectionId);
  const exercise = section?.exercises.find(ex => ex.id === exerciseId);
  const setItem = exercise?.sets.find(s => s.id === setId);
  if (!setItem) { console.warn('[store] toggleSetComplete: sectionId not found', sectionId); return; }
  const newCompleted = !setItem.completed;

  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        sections: w.sections.map(sec => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            exercises: sec.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex;
              return { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s) };
            }),
          };
        }),
      };
    }),
  }));
  syncToggleSetComplete(setId, newCompleted);
},
```

- [ ] **Step 3: Replace `updateSetData` implementation**

New:
```ts
updateSetData: (workoutId, sectionId, exerciseId, setId, data) => {
  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        sections: w.sections.map(sec => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            exercises: sec.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex;
              return { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, ...data } : s) };
            }),
          };
        }),
      };
    }),
  }));
  syncUpdateSetData(setId, data);
},
```

- [ ] **Step 4: Replace `addExerciseToWorkout` and `removeExerciseFromWorkout` with section-aware versions**

Remove `addExerciseToWorkout` and `removeExerciseFromWorkout` entirely. Add:

```ts
addExerciseToSection: (workoutId, sectionId, exercise) => {
  const workout = get().workouts.find(w => w.id === workoutId);
  const section = workout?.sections.find(s => s.id === sectionId);
  if (!section) { console.warn('[store] addExerciseToSection: sectionId not found', sectionId); return; }

  const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newWorkoutExercise: WorkoutExercise = {
    id: makeId(),
    exerciseId: exercise.id,
    exercise,
    sets: [
      { id: makeId(), reps: 10, weight: 16, completed: false },
      { id: makeId(), reps: 10, weight: 16, completed: false },
      { id: makeId(), reps: 10, weight: 16, completed: false },
    ],
    restSeconds: 60,
    order: section.exercises.length,
  };

  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        sections: w.sections.map(sec => {
          if (sec.id !== sectionId) return sec;
          return { ...sec, exercises: [...sec.exercises, newWorkoutExercise] };
        }),
      };
    }),
  }));
  // Use syncAddExerciseToSection (not the old syncAddExerciseToWorkout) so section_id is persisted
  syncAddExerciseToSection(workoutId, sectionId, newWorkoutExercise);
},

removeExerciseFromSection: (workoutId, sectionId, exerciseId) => {
  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        sections: w.sections.map(sec => {
          if (sec.id !== sectionId) return sec;
          return { ...sec, exercises: sec.exercises.filter(e => e.id !== exerciseId) };
        }),
      };
    }),
  }));
  syncRemoveExerciseFromWorkout(exerciseId);
},
```

- [ ] **Step 5: Replace `addSetToExercise`**

New:
```ts
addSetToExercise: (workoutId, sectionId, exerciseId) => {
  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        sections: w.sections.map(sec => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            exercises: sec.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex;
              const lastSet = ex.sets[ex.sets.length - 1];
              const newSet: ExerciseSet = {
                id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight || 16,
                completed: false,
              };
              syncAddSet(exerciseId, newSet.id, newSet.reps, newSet.weight, ex.sets.length + 1);
              return { ...ex, sets: [...ex.sets, newSet] };
            }),
          };
        }),
      };
    }),
  }));
},
```

- [ ] **Step 6: Add section management actions**

```ts
addSection: (workoutId, name) => {
  const newSection: WorkoutSection = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    exercises: [],
  };
  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      return { ...w, sections: [...w.sections, newSection] };
    }),
  }));
},

removeSection: (workoutId, sectionId) => {
  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      return { ...w, sections: w.sections.filter(s => s.id !== sectionId) };
    }),
  }));
},

renameSection: (workoutId, sectionId, name) => {
  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        sections: w.sections.map(s => s.id === sectionId ? { ...s, name } : s),
      };
    }),
  }));
},

reorderSections: (workoutId, orderedSectionIds) => {
  set((state) => ({
    workouts: state.workouts.map(w => {
      if (w.id !== workoutId) return w;
      const sectionMap = Object.fromEntries(w.sections.map(s => [s.id, s]));
      const reordered = orderedSectionIds.map(id => sectionMap[id]).filter(Boolean);
      return { ...w, sections: reordered };
    }),
  }));
},
```

- [ ] **Step 7: Add exercise type actions**

```ts
setExerciseType: (exerciseId, type) => {
  set((state) => ({
    exercises: state.exercises.map(e =>
      e.id === exerciseId ? { ...e, exerciseType: type } : e
    ),
  }));
},

updateWarmupDefaults: (exerciseId, defaults) => {
  set((state) => ({
    exercises: state.exercises.map(e =>
      e.id === exerciseId ? { ...e, warmupDefaults: defaults } : e
    ),
  }));
},
```

- [ ] **Step 8: Add collapse state + action**

Add to initial state:
```ts
sectionCollapseState: {} as Record<string, boolean>,
```

Add action:
```ts
toggleSectionCollapsed: (sectionId) => {
  set((state) => ({
    sectionCollapseState: {
      ...state.sectionCollapseState,
      [sectionId]: !state.sectionCollapseState[sectionId],
    },
  }));
},
```

- [ ] **Step 9: Add `exercises` and `sectionCollapseState` to persist partialize**

```ts
partialize: (state) => ({
  userName: state.userName,
  userEmail: state.userEmail,
  authUserId: state.authUserId,
  profileId: state.profileId,
  userEquipment: state.userEquipment,
  unlockedExercises: state.unlockedExercises,
  exercises: state.exercises,          // NEW — persists exerciseType overrides
  sectionCollapseState: state.sectionCollapseState, // NEW — persists collapse UI state
  workouts: state.workouts,
  schedule: state.schedule,
  theme: state.theme,
}),
```

- [ ] **Step 10: Apply migration in `hydrateStore`**

Update `hydrateStore`:
```ts
hydrateStore: (data) => set({
  profileId: data.profileId,
  userName: data.userName,
  userEmail: data.userEmail,
  userEquipment: data.userEquipment.length > 0 ? data.userEquipment : ['kettlebell', 'bodyweight'],
  workouts: data.workouts.map(migrateWorkout),  // apply migration
  schedule: data.schedule,
  unlockedExercises: data.unlockedExercises,
  isHydrated: true,
}),
```

Also add a `onRehydrateStorage` callback in the persist config to handle localStorage migration:
```ts
// In the persist() options object, after partialize:
onRehydrateStorage: () => (state) => {
  if (state) {
    state.workouts = state.workouts.map(migrateWorkout);
  }
},
```

- [ ] **Step 11: Update `addWorkout` to initialize with default sections**

```ts
addWorkout: (workout) => {
  // Ensure new workouts have sections
  const migratedWorkout = migrateWorkout(workout);
  // If no sections yet, add defaults
  if (migratedWorkout.sections.length === 0) {
    migratedWorkout.sections = [
      { id: `${Date.now()}-warmup`, name: 'Warmup', exercises: [] },
      { id: `${Date.now()}-main`, name: 'Main', exercises: [] },
    ];
  }
  set((state) => ({ workouts: [migratedWorkout, ...state.workouts] }));
  const { profileId } = get();
  if (profileId) syncAddWorkout(migratedWorkout, profileId);
},
```

- [ ] **Step 12: Build to verify store compiles**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | grep -v "WorkoutsPage\|ProgressPage\|hydrate" | head -30
```

The store itself should have no errors. Remaining errors will be in pages/components (fixed in later tasks).

- [ ] **Step 13: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/store/useStore.ts && git commit -m "- update store: add section actions, exercise type actions, migrate workouts on hydration;"
```

---

## Chunk 3: GraphQL & Sync Layer

### Task 5: Update GraphQL mutations

**Files:**
- Modify: `src/lib/gql/mutations.ts`

- [ ] **Step 1: Add workout_sections mutations**

Append to `src/lib/gql/mutations.ts`:
```ts
// ── Workout Sections ──
export const INSERT_WORKOUT_SECTIONS = `
  mutation InsertWorkoutSections($objects: [workout_sections_insert_input!]!) {
    insert_workout_sections(objects: $objects) {
      affected_rows
    }
  }
`;

export const DELETE_WORKOUT_SECTIONS = `
  mutation DeleteWorkoutSections($where: workout_sections_bool_exp!) {
    delete_workout_sections(where: $where) {
      affected_rows
    }
  }
`;

export const UPDATE_WORKOUT_SECTION = `
  mutation UpdateWorkoutSection($where: workout_sections_bool_exp!, $_set: workout_sections_set_input!) {
    update_workout_sections(where: $where, _set: $_set) {
      affected_rows
    }
  }
`;
```

- [ ] **Step 2: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/lib/gql/mutations.ts && git commit -m "- add workout_sections GraphQL mutations;"
```

---

### Task 6: Update GraphQL queries

**Files:**
- Modify: `src/lib/gql/queries.ts`

- [ ] **Step 1: Add `section_id` to `GET_WORKOUT_EXERCISES` and add `GET_WORKOUT_SECTIONS`**

Update `GET_WORKOUT_EXERCISES`:
```ts
export const GET_WORKOUT_EXERCISES = `
  query GetWorkoutExercises($workoutIds: [String!]!) {
    workout_exercises(where: { workout_id: { _in: $workoutIds } }) {
      id
      workout_id
      exercise_id
      exercise_order
      notes
      rest_seconds
      section_id
    }
  }
`;
```

Add new query:
```ts
export const GET_WORKOUT_SECTIONS = `
  query GetWorkoutSections($workoutIds: [String!]!) {
    workout_sections(where: { workout_id: { _in: $workoutIds } }, order_by: { position: asc }) {
      id
      workout_id
      name
      position
    }
  }
`;
```

Remove `warmup` from `GET_USER_WORKOUTS` (no longer in the Workout type):
```ts
export const GET_USER_WORKOUTS = `
  query GetUserWorkouts($userId: Int!) {
    workouts(where: { user_id: { _eq: $userId } }, order_by: { date: desc }) {
      id
      name
      type
      date
      completed
      duration_minutes
      equipment
      focus_areas
      notes
      place
      user_id
    }
  }
`;
```

- [ ] **Step 2: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/lib/gql/queries.ts && git commit -m "- add section_id to workout exercises query; add GET_WORKOUT_SECTIONS query; remove warmup from workouts query;"
```

---

### Task 7: Update `src/lib/gql/sync.ts`

**Files:**
- Modify: `src/lib/gql/sync.ts`

- [ ] **Step 1: Add new imports**

```ts
import {
  // ...existing imports...
  INSERT_WORKOUT_SECTIONS,
  DELETE_WORKOUT_SECTIONS,
} from './mutations';
import type { Workout, WorkoutExercise, WorkoutSection, ScheduleEntry, Equipment } from '../types';
```

- [ ] **Step 2: Update `syncAddWorkout`**

Remove `warmup: workout.warmup ?? null` from the workout insert object.

After inserting the workout, also insert sections then exercises with `section_id`:

```ts
export function syncAddWorkout(workout: Workout, userId: number) {
  fire(
    gqlRequest(INSERT_WORKOUT, {
      objects: [
        {
          id: workout.id,
          name: workout.name,
          type: workout.type,
          date: workout.date,
          user_id: userId,
          completed: workout.completed,
          duration_minutes: workout.durationMinutes ?? null,
          equipment: workout.equipment,
          focus_areas: workout.focusAreas,
          notes: workout.notes ?? null,
          place: workout.place ?? null,
        },
      ],
    }).then(() => {
      if (workout.sections.length > 0) {
        return syncInsertSectionsAndExercises(workout.id, workout.sections);
      }
    })
  );
}
```

- [ ] **Step 3: Add `syncInsertSectionsAndExercises` helper**

```ts
function syncInsertSectionsAndExercises(workoutId: string, sections: WorkoutSection[]) {
  const sectionObjects = sections.map((sec, i) => ({
    id: sec.id,
    workout_id: workoutId,
    name: sec.name,
    position: i,
  }));

  fire(
    gqlRequest(INSERT_WORKOUT_SECTIONS, { objects: sectionObjects }).then(() => {
      const allExercises = sections.flatMap(sec =>
        sec.exercises.map(ex => ({ ...ex, _sectionId: sec.id }))
      );
      if (allExercises.length > 0) {
        // Call the raw helper directly (no extra fire() wrapping — already inside fire() chain)
        return rawInsertWorkoutExercises(workoutId, allExercises);
      }
    })
  );
}
```

**Note:** `syncInsertWorkoutExercises` must NOT be called here because it wraps in its own `fire()`, creating a double-wrapped Promise that discards errors. Instead, extract the raw Promise logic into a `rawInsertWorkoutExercises` helper and call `syncInsertWorkoutExercises` (which uses `fire()`) only from the public API. Update Step 4 accordingly.
```

- [ ] **Step 4: Split `syncInsertWorkoutExercises` into a raw helper and a public fire-and-forget wrapper**

Replace the existing `syncInsertWorkoutExercises` with two functions:

```ts
// Raw Promise — returns a Promise, does NOT call fire(). Used inside chains.
function rawInsertWorkoutExercises(
  workoutId: string,
  exercises: (WorkoutExercise & { _sectionId?: string })[]
): Promise<unknown> {
  const weObjects = exercises.map((ex) => ({
    id: ex.id,
    workout_id: workoutId,
    exercise_id: ex.exerciseId,
    exercise_order: ex.order,
    notes: ex.notes ?? null,
    rest_seconds: ex.restSeconds,
    section_id: ex._sectionId ?? null,
  }));

  return gqlRequest(INSERT_WORKOUT_EXERCISES, { objects: weObjects }).then(() => {
    const setObjects = exercises.flatMap((ex) =>
      ex.sets.map((s, i) => ({
        id: s.id,
        workout_exercise_id: ex.id,
        set_number: i + 1,
        reps: s.reps,
        weight: s.weight,
        completed: s.completed,
        notes: s.notes ?? null,
      }))
    );
    if (setObjects.length > 0) {
      return gqlRequest(INSERT_EXERCISE_SETS, { objects: setObjects });
    }
  });
}

// Public fire-and-forget wrapper — used only at the top level (not inside other fire() chains)
function syncInsertWorkoutExercises(
  workoutId: string,
  exercises: (WorkoutExercise & { _sectionId?: string })[]
) {
  fire(rawInsertWorkoutExercises(workoutId, exercises));
}
```
```

- [ ] **Step 5: Update `syncUpdateWorkout` — remove `warmup` handling**

Remove this line from `syncUpdateWorkout`:
```ts
if (updates.warmup !== undefined) _set.warmup = updates.warmup;
```

- [ ] **Step 6: Add `syncAddExerciseToSection` export for UI use**

```ts
export function syncAddExerciseToSection(workoutId: string, sectionId: string, exercise: WorkoutExercise) {
  fire(
    gqlRequest(INSERT_WORKOUT_EXERCISES, {
      objects: [
        {
          id: exercise.id,
          workout_id: workoutId,
          exercise_id: exercise.exerciseId,
          exercise_order: exercise.order,
          notes: exercise.notes ?? null,
          rest_seconds: exercise.restSeconds,
          section_id: sectionId,
        },
      ],
    }).then(() => {
      if (exercise.sets.length > 0) {
        const setObjects = exercise.sets.map((s, i) => ({
          id: s.id,
          workout_exercise_id: exercise.id,
          set_number: i + 1,
          reps: s.reps,
          weight: s.weight,
          completed: s.completed,
          notes: s.notes ?? null,
        }));
        return gqlRequest(INSERT_EXERCISE_SETS, { objects: setObjects });
      }
    })
  );
}
```

- [ ] **Step 7: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/lib/gql/sync.ts && git commit -m "- update sync to use sections; insert section_id on workout exercises; remove warmup from workout sync;"
```

---

### Task 8: Update `src/lib/gql/hydrate.ts`

**Files:**
- Modify: `src/lib/gql/hydrate.ts`

- [ ] **Step 1: Add new imports**

```ts
import {
  GET_USER_PROFILE,
  GET_USER_WORKOUTS,
  GET_WORKOUT_EXERCISES,
  GET_WORKOUT_SECTIONS,   // NEW
  GET_EXERCISE_SETS,
  GET_USER_SCHEDULE,
  GET_USER_UNLOCKS,
} from './queries';
import type {
  Workout,
  WorkoutExercise,
  WorkoutSection,   // NEW
  ExerciseSet,
  ScheduleEntry,
  Equipment,
} from '../types';
```

- [ ] **Step 2: Add `ServerWorkoutSection` interface**

```ts
interface ServerWorkoutSection {
  id: string;
  workout_id: string;
  name: string;
  position: number;
}
```

- [ ] **Step 3: Update `ServerWorkoutExercise` to include `section_id`**

```ts
interface ServerWorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_order: number;
  notes: string | null;
  rest_seconds: number | null;
  section_id: string | null;   // NEW
}
```

- [ ] **Step 4: Update `ServerWorkout` — remove `warmup`**

Remove `warmup: string | null;` from `ServerWorkout`.

- [ ] **Step 5: Fetch sections alongside exercises in `hydrateFromServer`**

In the section `// 3. Fetch workout exercises + sets`, also fetch sections:

```ts
// 3. Fetch workout exercises, sets, and sections
const workoutIds = workoutsRes.workouts.map((w) => w.id);
const workoutExercisesMap: Record<string, ServerWorkoutExercise[]> = {};
const exerciseSetsMap: Record<string, ServerExerciseSet[]> = {};
const workoutSectionsMap: Record<string, ServerWorkoutSection[]> = {};

if (workoutIds.length > 0) {
  const [weRes, sectionsRes] = await Promise.all([
    gqlRequest<{ workout_exercises: ServerWorkoutExercise[] }>(GET_WORKOUT_EXERCISES, { workoutIds }),
    gqlRequest<{ workout_sections: ServerWorkoutSection[] }>(GET_WORKOUT_SECTIONS, { workoutIds }),
  ]);

  for (const we of weRes.workout_exercises) {
    if (!workoutExercisesMap[we.workout_id]) workoutExercisesMap[we.workout_id] = [];
    workoutExercisesMap[we.workout_id].push(we);
  }

  for (const sec of sectionsRes.workout_sections) {
    if (!workoutSectionsMap[sec.workout_id]) workoutSectionsMap[sec.workout_id] = [];
    workoutSectionsMap[sec.workout_id].push(sec);
  }

  const weIds = weRes.workout_exercises.map((we) => we.id);
  if (weIds.length > 0) {
    const setsRes = await gqlRequest<{ exercise_sets: ServerExerciseSet[] }>(
      GET_EXERCISE_SETS,
      { workoutExerciseIds: weIds }
    );
    for (const s of setsRes.exercise_sets) {
      if (!exerciseSetsMap[s.workout_exercise_id]) exerciseSetsMap[s.workout_exercise_id] = [];
      exerciseSetsMap[s.workout_exercise_id].push(s);
    }
  }
}
```

- [ ] **Step 6: Reconstruct sections in the workout transform**

Replace the `// 4. Transform server data` block's workout mapping:

```ts
const workouts: Workout[] = workoutsRes.workouts.map((sw) => {
  const serverExercises = workoutExercisesMap[sw.id] || [];
  const serverSections = workoutSectionsMap[sw.id] || [];

  // Build WorkoutExercise objects
  const workoutExercises: WorkoutExercise[] = serverExercises
    .sort((a, b) => a.exercise_order - b.exercise_order)
    .map((swe) => {
      const exercise = EXERCISES.find((e) => e.id === swe.exercise_id);
      const serverSets = (exerciseSetsMap[swe.id] || []).sort((a, b) => a.set_number - b.set_number);
      const sets: ExerciseSet[] = serverSets.map((ss) => ({
        id: ss.id,
        reps: ss.reps,
        weight: Number(ss.weight),
        completed: ss.completed ?? false,
        notes: ss.notes ?? undefined,
      }));

      return {
        id: swe.id,
        exerciseId: swe.exercise_id,
        exercise: exercise || {
          id: swe.exercise_id,
          name: swe.exercise_id,
          category: 'grind' as const,
          movementPattern: 'hinge' as const,
          equipment: ['kettlebell' as const],
          focusAreas: ['strength' as const],
          difficulty: 'beginner' as const,
          description: '',
          cues: [],
          unlocked: true,
          exerciseType: 'main' as const,
        },
        sets,
        restSeconds: swe.rest_seconds ?? 60,
        notes: swe.notes ?? undefined,
        order: swe.exercise_order,
        _sectionId: swe.section_id,  // temp field for grouping
      };
    });

  // Group exercises into sections
  let sections: WorkoutSection[];
  if (serverSections.length > 0) {
    sections = serverSections.map((sec) => ({
      id: sec.id,
      name: sec.name,
      exercises: workoutExercises
        .filter((ex: any) => ex._sectionId === sec.id)
        .map(({ _sectionId, ...ex }: any) => ex),
    }));
    // Exercises without a section go into a fallback Main section
    const unsectioned = workoutExercises
      .filter((ex: any) => !ex._sectionId || !serverSections.find(s => s.id === ex._sectionId))
      .map(({ _sectionId, ...ex }: any) => ex);
    if (unsectioned.length > 0) {
      sections.push({ id: `fallback-${sw.id}`, name: 'Main', exercises: unsectioned });
    }
  } else {
    // No sections in DB — legacy workout, wrap in Main
    sections = [{
      id: `migrated-${sw.id}`,
      name: 'Main',
      exercises: workoutExercises.map(({ _sectionId, ...ex }: any) => ex),
    }];
  }

  return {
    id: sw.id,
    name: sw.name,
    type: sw.type as Workout['type'],
    date: sw.date,
    sections,
    notes: sw.notes ?? undefined,
    focusAreas: parseArrayField(sw.focus_areas) as Workout['focusAreas'],
    equipment: parseArrayField(sw.equipment) as Workout['equipment'],
    durationMinutes: sw.duration_minutes ?? undefined,
    completed: sw.completed ?? false,
    place: sw.place ?? undefined,
  };
});
```

- [ ] **Step 7: Build full project**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | grep -v "WorkoutsPage\|ProgressPage" | head -40
```

Remaining errors should only be in `WorkoutsPage.tsx` and any page that uses `workout.exercises`. All lib/store files should be clean.

- [ ] **Step 8: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/lib/gql/hydrate.ts src/lib/gql/queries.ts && git commit -m "- update hydration to reconstruct sections from server; fetch workout_sections in parallel;"
```

---

## Chunk 4: UI Components

### Task 9: Create `src/components/workout/ExerciseCard.tsx`

PDF-style card for main exercises. Collapsed = name + cues + sets×reps + checkbox. Expanded = per-set editing.

**Files:**
- Create: `src/components/workout/ExerciseCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/workout/ExerciseCard.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { WorkoutExercise } from '../../lib/types';
import { IconTrash, IconCheck, IconPencil } from '../icons/Icons';

interface ExerciseCardProps {
  workoutId: string;
  sectionId: string;
  workoutExercise: WorkoutExercise;
  index: number;
  isCompleted: boolean;  // workout.completed
}

export function ExerciseCard({ workoutId, sectionId, workoutExercise: we, index, isCompleted }: ExerciseCardProps) {
  const [editing, setEditing] = useState(false);
  const { toggleSetComplete, updateSetData, addSetToExercise, removeExerciseFromSection } = useStore();

  const allSetsComplete = we.sets.length > 0 && we.sets.every(s => s.completed);
  const completedCount = we.sets.filter(s => s.completed).length;
  const totalSets = we.sets.length;

  // Summarize reps: show range if sets differ, otherwise single value
  const repsValues = [...new Set(we.sets.map(s => s.reps))];
  const repsDisplay = repsValues.length === 1
    ? String(repsValues[0])
    : `${Math.min(...repsValues)}-${Math.max(...repsValues)}`;

  const handleMarkAllComplete = () => {
    if (isCompleted) return;
    we.sets.forEach(s => {
      if (!s.completed) toggleSetComplete(workoutId, sectionId, we.id, s.id);
    });
  };

  return (
    <div className="py-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-white/25 w-5 text-right tabular-nums shrink-0">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-[12px] md:text-[14px] tracking-[0.06em] font-bold truncate">
              {we.exercise.name}
            </span>
          </div>
          {/* Cues */}
          {we.exercise.cues.length > 0 && (
            <ul className="ml-7 space-y-1">
              {we.exercise.cues.map((cue, i) => (
                <li key={i} className="text-[10px] text-white/40 leading-relaxed flex gap-1.5">
                  <span className="text-white/20 shrink-0">•</span>
                  {cue}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {!isCompleted && (
            <>
              <button
                onClick={() => setEditing(e => !e)}
                className="p-1.5 hover:bg-white/5 transition-colors text-white/25 hover:text-white/60"
                aria-label="Edit sets"
              >
                <IconPencil size={12} />
              </button>
              <button
                onClick={() => removeExerciseFromSection(workoutId, sectionId, we.id)}
                className="p-1.5 hover:bg-white/5 transition-colors text-white/25 hover:text-red-400/70"
                aria-label="Remove exercise"
              >
                <IconTrash size={12} />
              </button>
            </>
          )}
          <button
            onClick={handleMarkAllComplete}
            disabled={isCompleted}
            className={`w-7 h-7 border transition-all flex items-center justify-center ${
              allSetsComplete
                ? 'border-[#C6FF00]/60 bg-[#C6FF00]/10 text-[#C6FF00]'
                : 'border-white/15 text-transparent hover:border-white/30'
            }`}
            aria-label="Mark all complete"
          >
            <IconCheck size={12} />
          </button>
        </div>
      </div>

      {/* Sets summary / sets×reps */}
      <div className="ml-7 mt-2 flex items-center justify-between">
        <span className="text-[9px] text-white/25">
          {completedCount}/{totalSets} sets done
        </span>
        <span className="text-[10px] text-white/40 tabular-nums">
          {totalSets} × {repsDisplay}
        </span>
      </div>

      {/* Edit mode */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden ml-7 mt-3"
          >
            {/* Column headers */}
            <div className="grid grid-cols-[20px_1fr_1fr_28px] gap-2 mb-2">
              <span className="text-[8px] text-white/25 tracking-wider">#</span>
              <span className="text-[8px] text-white/25 tracking-wider">REPS</span>
              <span className="text-[8px] text-white/25 tracking-wider">KG</span>
              <span className="text-[8px] text-white/25 tracking-wider text-right">✓</span>
            </div>
            {we.sets.map((s, i) => (
              <div key={s.id} className="grid grid-cols-[20px_1fr_1fr_28px] gap-2 mb-2 items-center">
                <span className="text-[9px] text-white/30 text-right">{i + 1}</span>
                <input
                  type="number"
                  value={s.reps}
                  onChange={e => updateSetData(workoutId, sectionId, we.id, s.id, { reps: Number(e.target.value) })}
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white text-center py-1 px-2 w-full focus:outline-none focus:border-white/25"
                  min={1}
                />
                <input
                  type="number"
                  value={s.weight}
                  onChange={e => updateSetData(workoutId, sectionId, we.id, s.id, { weight: Number(e.target.value) })}
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white text-center py-1 px-2 w-full focus:outline-none focus:border-white/25"
                  min={0}
                  step={0.5}
                />
                <button
                  onClick={() => toggleSetComplete(workoutId, sectionId, we.id, s.id)}
                  className={`w-7 h-7 border flex items-center justify-center ${
                    s.completed ? 'border-[#C6FF00]/50 bg-[#C6FF00]/10 text-[#C6FF00]' : 'border-white/15 text-transparent'
                  }`}
                >
                  <IconCheck size={10} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => addSetToExercise(workoutId, sectionId, we.id)}
                className="text-[9px] text-white/40 hover:text-white/70 transition-colors tracking-[0.1em] uppercase"
              >
                + Set
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-[9px] text-white/40 hover:text-white/70 transition-colors tracking-[0.1em] uppercase ml-auto"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Note:** `IconPencil` may need to be added to `src/components/icons/Icons.tsx` if not already present. Check and add a simple pencil SVG icon if missing.

- [ ] **Step 2: Check if `IconPencil` exists in Icons.tsx**

```bash
grep -n "IconPencil" /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker/src/components/icons/Icons.tsx
```

If not found, add to Icons.tsx:
```tsx
export function IconPencil({ size = 16, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
```

- [ ] **Step 3: Build to verify**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | grep ExerciseCard | head -20
```

- [ ] **Step 4: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/components/workout/ExerciseCard.tsx src/components/icons/Icons.tsx && git commit -m "- add ExerciseCard component with PDF-style layout and per-set edit mode;"
```

---

### Task 10: Create `src/components/workout/WarmupCard.tsx`

Minimal card — no per-set editing, no weight field.

**Files:**
- Create: `src/components/workout/WarmupCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/workout/WarmupCard.tsx
import { useStore } from '../../store/useStore';
import type { WorkoutExercise } from '../../lib/types';
import { IconCheck, IconTrash } from '../icons/Icons';

interface WarmupCardProps {
  workoutId: string;
  sectionId: string;
  workoutExercise: WorkoutExercise;
  isCompleted: boolean;
}

export function WarmupCard({ workoutId, sectionId, workoutExercise: we, isCompleted }: WarmupCardProps) {
  const { removeExerciseFromSection } = useStore();
  const defaults = we.exercise.warmupDefaults;
  const hint = defaults?.hint || we.exercise.cues[0] || '';
  const setsReps = defaults
    ? `${defaults.sets} × ${defaults.reps}`
    : `${we.sets.length} × ${we.sets[0]?.reps ?? 10}`;

  // Warmup is marked done as a whole — first set's completed is the proxy
  const done = we.sets.length > 0 && we.sets[0].completed;
  const { toggleSetComplete } = useStore();

  const handleToggleDone = () => {
    if (isCompleted || !we.sets[0]) return;
    toggleSetComplete(workoutId, sectionId, we.id, we.sets[0].id);
  };

  return (
    <div className="py-2.5 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[8px] tracking-[0.12em] font-bold text-[#C6FF00]/60 border border-[#C6FF00]/20 px-1.5 py-0.5 shrink-0">
            WARMUP
          </span>
          <span className="text-[11px] md:text-[13px] tracking-[0.06em] font-bold truncate">
            {we.exercise.name}
          </span>
        </div>
        {hint && (
          <p className="text-[10px] text-white/40 leading-relaxed ml-0 mb-1">
            {hint}
          </p>
        )}
        {/* Additional cues beyond hint */}
        {we.exercise.cues.slice(1).map((cue, i) => (
          <p key={i} className="text-[10px] text-white/30 leading-relaxed flex gap-1.5">
            <span className="text-white/20 shrink-0">•</span>
            {cue}
          </p>
        ))}
        <span className="text-[10px] text-white/30 tabular-nums mt-1 block">{setsReps}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        {!isCompleted && (
          <button
            onClick={() => removeExerciseFromSection(workoutId, sectionId, we.id)}
            className="p-1.5 hover:bg-white/5 transition-colors text-white/20 hover:text-red-400/60"
            aria-label="Remove warmup"
          >
            <IconTrash size={11} />
          </button>
        )}
        <button
          onClick={handleToggleDone}
          disabled={isCompleted}
          className={`w-6 h-6 border flex items-center justify-center transition-all ${
            done
              ? 'border-[#C6FF00]/60 bg-[#C6FF00]/10 text-[#C6FF00]'
              : 'border-white/15 text-transparent hover:border-white/25'
          }`}
          aria-label="Mark warmup done"
        >
          <IconCheck size={10} />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build to verify**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | grep WarmupCard | head -10
```

- [ ] **Step 3: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/components/workout/WarmupCard.tsx && git commit -m "- add WarmupCard component with minimal layout;"
```

---

### Task 11: Create `src/components/workout/AddExerciseModal.tsx`

Modal for adding exercises to a section. Warmup sections show warmup-type exercises first, with an "All Exercises" expandable below. Regular sections show the standard exercise picker. Includes promote-to-warmup flow.

**Files:**
- Create: `src/components/workout/AddExerciseModal.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/workout/AddExerciseModal.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { Exercise, WarmupDefaults, ExerciseType } from '../../lib/types';
import { IconClose, IconChevronDown } from '../icons/Icons';

interface AddExerciseModalProps {
  workoutId: string;
  sectionId: string;
  sectionName: string;
  onClose: () => void;
}

export function AddExerciseModal({ workoutId, sectionId, sectionName, onClose }: AddExerciseModalProps) {
  const exercises = useStore(s => s.exercises);
  const unlockedExercises = useStore(s => s.unlockedExercises);
  const userEquipment = useStore(s => s.userEquipment);
  const { addExerciseToSection, setExerciseType, updateWarmupDefaults } = useStore();

  const isWarmupSection = sectionName.toLowerCase() === 'warmup' || sectionName.toLowerCase().includes('warm');

  const [showAll, setShowAll] = useState(!isWarmupSection);
  const [promotingExercise, setPromotingExercise] = useState<Exercise | null>(null);
  const [warmupForm, setWarmupForm] = useState<WarmupDefaults>({ sets: 2, reps: '10', hint: '' });

  const warmupExercises = exercises.filter(e => e.exerciseType === 'warmup' && unlockedExercises.includes(e.id));
  const mainExercises = exercises.filter(e =>
    e.exerciseType === 'main' &&
    unlockedExercises.includes(e.id) &&
    e.equipment.some(eq => userEquipment.includes(eq))
  );

  const handleAddWarmup = (exercise: Exercise) => {
    addExerciseToSection(workoutId, sectionId, exercise);
    onClose();
  };

  const handleAddMain = (exercise: Exercise) => {
    if (isWarmupSection) {
      // Promote flow
      setPromotingExercise(exercise);
      setWarmupForm({ sets: 2, reps: '10', hint: exercise.cues[0] || '' });
    } else {
      addExerciseToSection(workoutId, sectionId, exercise);
      onClose();
    }
  };

  const handleConfirmPromote = () => {
    if (!promotingExercise) return;
    setExerciseType(promotingExercise.id, 'warmup');
    updateWarmupDefaults(promotingExercise.id, warmupForm);
    // Update the exercise object in memory for addExerciseToSection
    addExerciseToSection(workoutId, sectionId, {
      ...promotingExercise,
      exerciseType: 'warmup' as ExerciseType,
      warmupDefaults: warmupForm,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="modal-panel"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[13px] tracking-[0.1em] font-bold uppercase">
            {isWarmupSection ? 'Add Warmup' : `Add to ${sectionName}`}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors">
            <IconClose size={18} className="text-white/40" />
          </button>
        </div>

        {/* Promote flow */}
        {promotingExercise ? (
          <div>
            <p className="text-[10px] text-white/50 mb-4 leading-relaxed">
              Mark <span className="text-white/80">{promotingExercise.name}</span> as a warmup exercise (applies globally to all workouts).
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[9px] text-white/40 tracking-[0.1em] uppercase block mb-1.5">Sets</label>
                <input
                  type="number"
                  value={warmupForm.sets}
                  onChange={e => setWarmupForm(f => ({ ...f, sets: Number(e.target.value) }))}
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white py-2 px-3 w-full focus:outline-none focus:border-white/25"
                  min={1}
                />
              </div>
              <div>
                <label className="text-[9px] text-white/40 tracking-[0.1em] uppercase block mb-1.5">Reps</label>
                <input
                  type="text"
                  value={warmupForm.reps}
                  onChange={e => setWarmupForm(f => ({ ...f, reps: e.target.value }))}
                  placeholder="e.g. 10-15 or 20 sec"
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white py-2 px-3 w-full focus:outline-none focus:border-white/25"
                />
              </div>
              <div>
                <label className="text-[9px] text-white/40 tracking-[0.1em] uppercase block mb-1.5">Hint (cue)</label>
                <input
                  type="text"
                  value={warmupForm.hint}
                  onChange={e => setWarmupForm(f => ({ ...f, hint: e.target.value }))}
                  placeholder="e.g. Light pace, full range"
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white py-2 px-3 w-full focus:outline-none focus:border-white/25"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPromotingExercise(null)} className="btn btn-ghost flex-1">Back</button>
              <button onClick={handleConfirmPromote} className="btn btn-primary flex-1">Mark as Warmup & Add</button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            {/* Warmup exercises section (always shown for warmup sections, or expandable) */}
            {isWarmupSection && (
              <>
                <div className="section-label mb-3">Warmup Exercises</div>
                {warmupExercises.length === 0 ? (
                  <p className="text-[10px] text-white/30 mb-4">No warmup exercises yet.</p>
                ) : (
                  <div className="space-y-0 mb-5">
                    {warmupExercises.map(ex => (
                      <div key={ex.id}>
                        <button
                          onClick={() => handleAddWarmup(ex)}
                          className="w-full text-left py-2.5 hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[11px] md:text-[13px] tracking-[0.06em] font-bold">{ex.name}</span>
                              {ex.warmupDefaults && (
                                <span className="text-[9px] text-white/30 ml-2 tabular-nums">
                                  {ex.warmupDefaults.sets} × {ex.warmupDefaults.reps}
                                </span>
                              )}
                              {ex.warmupDefaults?.hint && (
                                <p className="text-[9px] text-white/30 mt-0.5">{ex.warmupDefaults.hint}</p>
                              )}
                            </div>
                            <span className="text-[9px] text-white/25 ml-3">+</span>
                          </div>
                        </button>
                        <div className="divider" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Browse all exercises toggle */}
                <button
                  onClick={() => setShowAll(s => !s)}
                  className="flex items-center gap-2 text-[9px] text-white/40 hover:text-white/70 transition-colors tracking-[0.1em] uppercase mb-3"
                >
                  <IconChevronDown size={12} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
                  Browse all exercises
                </button>
              </>
            )}

            {/* All/main exercises */}
            {(!isWarmupSection || showAll) && (
              <>
                {isWarmupSection && <div className="section-label mb-3">All Exercises</div>}
                {mainExercises.map(ex => (
                  <div key={ex.id}>
                    <button
                      onClick={() => handleAddMain(ex)}
                      className="w-full text-left py-2.5 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] md:text-[13px] tracking-[0.06em] font-bold">{ex.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-white/25 tracking-wider">{ex.difficulty}</span>
                            <span className="text-[8px] text-white/25">{ex.movementPattern}</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-white/25 ml-3">
                          {isWarmupSection ? 'use as warmup' : '+'}
                        </span>
                      </div>
                    </button>
                    <div className="divider" />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
```

**Note:** `IconChevronDown` may need to be added to Icons.tsx if not present (check with `grep -n "IconChevronDown" src/components/icons/Icons.tsx`). If missing, add a simple chevron-down SVG.

- [ ] **Step 2: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/components/workout/AddExerciseModal.tsx && git commit -m "- add AddExerciseModal with warmup picker and promote-to-warmup flow;"
```

---

### Task 12: Create `src/components/workout/WorkoutSection.tsx`

Section component with collapse, rename, drag handle, add exercise, and remove.

**Files:**
- Create: `src/components/workout/WorkoutSection.tsx`

- [ ] **Step 1: Install `@dnd-kit/core`**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Write the WorkoutSection component**

```tsx
// src/components/workout/WorkoutSection.tsx
import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { WorkoutSection as WorkoutSectionType, Workout } from '../../lib/types';
import { ExerciseCard } from './ExerciseCard';
import { WarmupCard } from './WarmupCard';
import { AddExerciseModal } from './AddExerciseModal';
import { IconChevronDown, IconPlus, IconTrash, IconGripVertical } from '../icons/Icons';

interface WorkoutSectionProps {
  workout: Workout;
  section: WorkoutSectionType;
  dragHandleProps?: Record<string, unknown>;
}

export function WorkoutSectionComponent({ workout, section, dragHandleProps }: WorkoutSectionProps) {
  const { renameSection, removeSection, sectionCollapseState, toggleSectionCollapsed } = useStore();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(section.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCollapsed = sectionCollapseState[section.id] ?? false;

  const isWarmupSection = section.name.toLowerCase().includes('warm');

  const handleRenameSubmit = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== section.name) {
      renameSection(workout.id, section.id, trimmed);
    } else {
      setNameValue(section.name);
    }
    setEditing(false);
  };

  const handleRemove = () => {
    if (section.exercises.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      removeSection(workout.id, section.id);
    }
  };

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3 group">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors p-1 -ml-1 touch-none"
          aria-label="Drag section"
        >
          <IconGripVertical size={14} />
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => toggleSectionCollapsed(section.id)}
          className="text-white/25 hover:text-white/60 transition-colors"
          aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
        >
          <IconChevronDown
            size={14}
            className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
          />
        </button>

        {/* Section name (editable) */}
        {editing ? (
          <input
            ref={inputRef}
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') { setNameValue(section.name); setEditing(false); } }}
            className="text-[10px] tracking-[0.15em] font-bold uppercase bg-transparent border-b border-white/30 text-white focus:outline-none flex-1 min-w-0"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.select(), 50); }}
            className="text-[10px] tracking-[0.15em] font-bold uppercase text-white/50 hover:text-white/80 transition-colors flex-1 text-left"
          >
            {section.name}
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowAddExercise(true)}
            className="p-1.5 hover:bg-white/5 transition-colors text-white/30 hover:text-white/70"
            aria-label="Add exercise"
          >
            <IconPlus size={12} />
          </button>
          <button
            onClick={handleRemove}
            className="p-1.5 hover:bg-white/5 transition-colors text-white/20 hover:text-red-400/60"
            aria-label="Remove section"
          >
            <IconTrash size={12} />
          </button>
        </div>
      </div>

      {/* Exercise list */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {section.exercises.length === 0 ? (
              <p className="text-[9px] text-white/20 pl-8 py-2">Empty section</p>
            ) : (
              <div className="space-y-0">
                {section.exercises.map((ex, idx) => (
                  <div key={ex.id}>
                    {idx > 0 && <div className="divider" />}
                    {isWarmupSection || ex.exercise.exerciseType === 'warmup' ? (
                      <WarmupCard
                        workoutId={workout.id}
                        sectionId={section.id}
                        workoutExercise={ex}
                        isCompleted={workout.completed}
                      />
                    ) : (
                      <ExerciseCard
                        workoutId={workout.id}
                        sectionId={section.id}
                        workoutExercise={ex}
                        index={idx}
                        isCompleted={workout.completed}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add exercise button */}
            {!workout.completed && (
              <button
                onClick={() => setShowAddExercise(true)}
                className="flex items-center gap-2 text-[9px] text-white/30 hover:text-white/60 transition-colors tracking-[0.1em] uppercase mt-3 pl-1"
              >
                <IconPlus size={11} />
                {isWarmupSection ? 'Add warmup exercise' : 'Add exercise'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="modal-panel"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-[12px] text-white/70 mb-5 leading-relaxed">
                Section "{section.name}" has {section.exercises.length} exercise{section.exercises.length !== 1 ? 's' : ''}. Remove anyway?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-ghost flex-1">Cancel</button>
                <button
                  onClick={() => { removeSection(workout.id, section.id); setShowDeleteConfirm(false); }}
                  className="btn flex-1 border border-red-400/40 text-red-400/70 hover:bg-red-400/10 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add exercise modal */}
      <AnimatePresence>
        {showAddExercise && (
          <AddExerciseModal
            workoutId={workout.id}
            sectionId={section.id}
            sectionName={section.name}
            onClose={() => setShowAddExercise(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Note:** Check if `IconGripVertical` and `IconChevronDown` exist in Icons.tsx:
```bash
grep -n "IconGripVertical\|IconChevronDown" /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker/src/components/icons/Icons.tsx
```

Add any missing icons:
```tsx
export function IconGripVertical({ size = 16, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
    </svg>
  );
}

export function IconChevronDown({ size = 16, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
```

- [ ] **Step 3: Build to verify**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | grep -E "WorkoutSection|AddExercise|WarmupCard|ExerciseCard" | head -20
```

- [ ] **Step 4: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/components/workout/ src/components/icons/Icons.tsx && git commit -m "- add WorkoutSection component with collapse, rename, drag handle, and exercise adding;"
```

---

## Chunk 5: Wire WorkoutsPage & DnD Sections

### Task 13: Update `src/pages/WorkoutsPage.tsx`

This is the largest UI change. The goal is to replace the flat exercise rendering with the new section-based components, and add drag-and-drop section reordering.

**Files:**
- Modify: `src/pages/WorkoutsPage.tsx`

- [ ] **Step 1: Read the full WorkoutsPage.tsx to understand current structure**

The file is large. Key areas to update:
1. `WorkoutDetail` component (line ~136): replace `workout.exercises` references with `workout.sections`
2. Remove: `const { toggleSetComplete, updateSetData, addSetToExercise, addExerciseToWorkout, removeExerciseFromWorkout, ... }` — these are now in the child components
3. Remove: the `availableExercises`, `recommendedExercises`, `otherExercises` local filter logic (moved to `AddExerciseModal`)
4. Remove: `handleAddExercise` (moved to store)
5. Remove: the `workout.warmup` display block
6. Replace: exercise list rendering with `WorkoutSectionComponent` + drag-and-drop wrapper
7. Add: "Add section" button at the bottom of sections

- [ ] **Step 2: Add new imports to WorkoutsPage.tsx**

```tsx
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WorkoutSectionComponent } from '../components/workout/WorkoutSection';
```

- [ ] **Step 3: Create a `SortableSection` wrapper component inside WorkoutsPage.tsx (or in WorkoutSection.tsx)**

```tsx
function SortableSection({ workout, section }: { workout: Workout; section: WorkoutSectionType }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <WorkoutSectionComponent
        workout={workout}
        section={section}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Update `WorkoutDetail` to use sections**

Replace the entire exercise rendering block in `WorkoutDetail`:

Remove:
```tsx
// Remove: allCompleted, totalSets, completedSets, progressPct based on workout.exercises
// Remove: availableExercises, recommendedExercises, otherExercises
// Remove: handleAddExercise function
// Remove: workout.warmup display block
// Remove: the {workout.exercises.map(...)} block
// Remove: showAddExercise modal that references old exercise list
```

Replace with:
```tsx
// Progress calculation from sections
const allExercises = workout.sections.flatMap(s => s.exercises);
const allCompleted = allExercises.length > 0 && allExercises.every(ex => ex.sets.every(s => s.completed));
const totalSets = allExercises.reduce((a, e) => a + e.sets.length, 0);
const completedSets = allExercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);
const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
```

Replace the exercise rendering block (the `<div className="space-y-0">` block) with:

```tsx
{/* DnD sortable sections */}
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleSectionDragEnd}
>
  <SortableContext
    items={workout.sections.map(s => s.id)}
    strategy={verticalListSortingStrategy}
  >
    {workout.sections.map(section => (
      <SortableSection key={section.id} workout={workout} section={section} />
    ))}
  </SortableContext>
</DndContext>

{/* Add section — inline input form */}
{!workout.completed && (
  addingSection ? (
    <form
      onSubmit={e => { e.preventDefault(); const v = newSectionName.trim(); if (v) addSection(workout.id, v); setAddingSection(false); setNewSectionName(''); }}
      className="flex items-center gap-2 mt-4"
    >
      <input
        autoFocus
        value={newSectionName}
        onChange={e => setNewSectionName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') { setAddingSection(false); setNewSectionName(''); } }}
        placeholder="Section name"
        className="bg-white/[0.04] border border-white/15 text-[11px] text-white py-1 px-2 focus:outline-none focus:border-white/30 flex-1"
      />
      <button type="submit" className="text-[9px] text-white/50 hover:text-white/80 tracking-[0.1em] uppercase px-2">Add</button>
      <button type="button" onClick={() => { setAddingSection(false); setNewSectionName(''); }} className="text-[9px] text-white/30 hover:text-white/60 tracking-[0.1em] uppercase px-1">Cancel</button>
    </form>
  ) : (
    <button
      onClick={() => setAddingSection(true)}
      className="flex items-center gap-2 text-[9px] text-white/25 hover:text-white/50 transition-colors tracking-[0.1em] uppercase mt-4"
    >
      <IconPlus size={11} /> Add section
    </button>
  )
)}
```

Add the required state to `WorkoutDetail`:
```tsx
const [addingSection, setAddingSection] = useState(false);
const [newSectionName, setNewSectionName] = useState('');
```

- [ ] **Step 5: Add `useSensors` and `handleSectionDragEnd` to `WorkoutDetail`**

```tsx
const { addSection, reorderSections } = useStore();
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);

const handleSectionDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    const currentOrder = workout.sections.map(s => s.id);
    const oldIndex = currentOrder.indexOf(String(active.id));
    const newIndex = currentOrder.indexOf(String(over.id));
    const reordered = [...currentOrder];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, String(active.id));
    reorderSections(workout.id, reordered);
  }
};
```

- [ ] **Step 6: Remove unused state and imports from WorkoutsPage.tsx**

Remove: `showAddExercise` state, `previewExercise` state (if still used, keep it for exercise info viewing), `selectedExerciseForTree` state if it's still needed.

Remove imports: `addExerciseToWorkout`, `removeExerciseFromWorkout` from `useStore` destructuring in `WorkoutDetail`.

Update the `workout.exercises` references in the workout list view (WorkoutsPage main list, not WorkoutDetail) to use `workout.sections.flatMap(s => s.exercises)`.

- [ ] **Step 7: Update workout creation in WorkoutsPage to use sections**

Find where new workouts are created (when starting from a template or blank). Update to use `sections` instead of `exercises`:

```tsx
const workout: Workout = {
  id: generateId(),
  name: template ? template.name : typeInfo.subtitle,
  type: goalToType(goal),
  date: today,
  sections: [
    {
      id: generateId(),
      name: 'Warmup',
      exercises: [],
    },
    {
      id: generateId(),
      name: 'Main',
      exercises: template
        ? template.exerciseIds.map((exId, idx) => {
            const exercise = EXERCISES.find(e => e.id === exId);
            if (!exercise) return null;
            return {
              id: generateId(),
              exerciseId: exId,
              exercise,
              sets: Array.from({ length: template.defaultSets }, (_, i) => ({
                id: generateId(),
                reps: template.defaultReps,
                weight: template.defaultWeight,
                completed: false,
              })),
              restSeconds: 60,
              order: idx,
            };
          }).filter(Boolean) as WorkoutExercise[]
        : [],
    },
  ],
  focusAreas: typeInfo.focusAreas,
  equipment: typeInfo.equipment,
  completed: false,
  notes: template?.notes,
};
```

- [ ] **Step 8: Fix any remaining TypeScript errors in WorkoutsPage.tsx**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | grep WorkoutsPage | head -30
```

Fix each error — common ones:
- `workout.exercises` → `workout.sections.flatMap(s => s.exercises)`
- `workout.warmup` → remove entirely
- Old `addExerciseToWorkout` calls → `addExerciseToSection`

- [ ] **Step 9: Full build check**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors.

- [ ] **Step 10: Check ProgressPage.tsx for references to `workout.exercises`**

```bash
grep -n "workout\.exercises\|\.exercises\." /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker/src/pages/ProgressPage.tsx | head -20
```

If found, update to use `workout.sections.flatMap(s => s.exercises)`.

- [ ] **Step 11: Commit**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add src/pages/WorkoutsPage.tsx src/pages/ProgressPage.tsx && git commit -m "- wire WorkoutsPage to use dynamic sections with drag-and-drop reordering;"
```

---

### Task 14: Manual verification

- [ ] **Step 1: Start dev server**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npm run dev
```

- [ ] **Step 2: Verify workout builder shows sections**

Open a workout. Confirm:
- Warmup and Main sections visible
- Section header shows name, chevron (collapse), drag handle, + button
- Tapping chevron collapses/expands section
- Tapping section name opens rename input

- [ ] **Step 3: Verify adding warmup exercises**

Click `+` on Warmup section → modal opens → warmup exercises listed → clicking one adds it → warmup card renders with WARMUP badge, hint, sets×reps, checkbox.

- [ ] **Step 4: Verify promote-to-warmup flow**

In add warmup modal → "Browse all exercises" → select a main exercise → promote form appears with sets/reps/hint inputs → "Mark as Warmup & Add" → exercise added as warmup, globally marked.

- [ ] **Step 5: Verify main exercise card**

In Main section → add exercise → card shows name + cues as bullets + sets×reps → pencil icon → edit mode shows per-set reps+weight inputs → "Done" collapses.

- [ ] **Step 6: Verify drag-and-drop sections**

Grab drag handle on section header → drag section to reorder → sections reorder correctly.

- [ ] **Step 7: Verify add/remove sections**

"+ Add section" button → prompt for name → new section appears → drag to reorder → remove button on empty section removes immediately, non-empty shows confirmation.

- [ ] **Step 8: Build production to check for any remaining issues**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no errors.

- [ ] **Step 9: Commit final state**

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker && git add -A && git commit -m "- complete warmup exercises and dynamic sections feature;"
```

---

## DB Migration Note

**The following SQL must be run in Neon PostgreSQL before deploying to production.** This cannot be done from the client app.

```sql
-- New table for workout sections
CREATE TABLE workout_sections (
  id         TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  position   INTEGER NOT NULL
);

-- Add section_id to workout_exercises (nullable for legacy rows)
-- NOTE: Using ON DELETE SET NULL (not CASCADE as in spec) so that deleting a section
-- does NOT delete the exercises — the hydration layer migrates orphaned exercises into
-- a fallback "Main" section. CASCADE would silently destroy exercise history.
ALTER TABLE workout_exercises
  ADD COLUMN section_id TEXT REFERENCES workout_sections(id) ON DELETE SET NULL;

-- Register in Hasura DDN: track workout_sections table and add relationships:
-- workout_sections.workout_id → workouts.id  (array relationship: sections)
-- workout_exercises.section_id → workout_sections.id  (object relationship: section)
```

Run this migration in Neon console or via Hasura DDN migration tooling before deploying. Existing `workout_exercises` rows will have `section_id = NULL` which is handled gracefully by the hydration migration path.
