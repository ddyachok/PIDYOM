# Warmup Exercises & Dynamic Workout Sections

**Date:** 2026-03-20
**Status:** Approved
**Branch:** feature/add-warmup-excersises

---

## Overview

Add warmup exercise support and redesign the workout builder to use dynamic, user-configurable sections. All exercise cards adopt a PDF-style compact format (name + cues + sets × reps). Users can add, rename, reorder, collapse, and remove sections within a workout. Warmup exercises are a first-class type with baked-in defaults, and any regular exercise can be promoted to warmup from within the "add warmup" flow.

---

## Goals

- Allow users to add warmup exercises to workouts in a dedicated warmup section
- Make workout sections fully dynamic (add, rename, reorder, collapse, remove)
- Redesign exercise cards to match PDF-style format: name + bullet cues + sets × reps + checkbox
- Preserve per-set data for progress tracking, but expose a simpler UI by default
- Allow any exercise to be promoted to warmup-capable from the add-warmup flow

---

## Non-Goals

- Cooldown sections (the `ExerciseType` enum is extensible but cooldown is not implemented now)
- Changing the progression/unlock system
- Changes to the Schedule page or workout creation flow

---

## Data Model

### `src/lib/types.ts`

#### New types

```ts
type ExerciseType = 'main' | 'warmup'
// Extensible: add 'cooldown' | 'mobility' etc. later

interface WarmupDefaults {
  sets: number
  reps: string   // supports ranges and time: "10-15", "20 sec", "8"
  hint: string   // displayed as the primary cue on the warmup card
}

interface WorkoutSection {
  id: string
  name: string              // user-editable, e.g. "Warmup", "Main", "Finisher"
  exercises: WorkoutExercise[]
  // Note: collapsed state is ephemeral UI state, stored in a separate
  // collapseState: Record<sectionId, boolean> key in the store, not on the section itself
}
```

Section order is determined by array position in `Workout.sections` — no separate `order` field to avoid dual source of truth. `reorderSections` replaces the entire array in the new order.

#### Changes to `Exercise`

```ts
interface Exercise {
  // ...all existing fields unchanged...
  exerciseType: ExerciseType        // default: 'main'
  warmupDefaults?: WarmupDefaults   // required when exerciseType === 'warmup'
}
```

**Note on global mutation:** `setExerciseType` and `updateWarmupDefaults` mutate the exercise definition globally for all workouts. This is intentional — if a user marks Bodyweight Squat as a warmup, it becomes available as warmup everywhere. The UI in the "add warmup" flow must make this clear: "Mark as warmup exercise (applies globally)".

#### Changes to `Workout`

- `exercises: WorkoutExercise[]` → **removed**, replaced by `sections`
- `warmup?: string` → **deprecated**: existing string value is discarded during migration. `WorkoutTemplate.warmup?: string` is also deprecated.

**WorkoutTemplate warmup replacement:** Templates currently carry `warmup?: string` (e.g. `"KB Halo x8 → Goblet Squat Prying x5"`). This field is replaced by having the workout creation flow initialize new workouts with two default empty sections (Warmup + Main), the same as all new workouts. Templates do not seed warmup exercise content — the user adds warmup exercises themselves. The `warmup` string field is removed from the `WorkoutTemplate` interface and all eight template definitions in `src/data/workouts.ts`.

```ts
interface Workout {
  // Remove: exercises: WorkoutExercise[]
  // Remove: warmup?: string  (deprecated, handled via migration)
  // Add:
  sections: WorkoutSection[]
  // ...all other existing fields unchanged...
}
```

New workouts are initialized with two default sections:
1. `{ id: generateId(), name: "Warmup", exercises: [] }`
2. `{ id: generateId(), name: "Main", exercises: [] }`

---

## Persistence Layer

### localStorage (Zustand)

- `exercises` array must be added to the `partialize` persist list in `useStore.ts` so that `setExerciseType` and `updateWarmupDefaults` survive page refresh. Currently `exercises` is seeded from the static `EXERCISES` import and is not persisted.
- Section collapse state is stored as `sectionCollapseState: Record<string, boolean>` in the store (keyed by `sectionId`), separate from the `Workout` object, so it is ephemeral UI state that does not sync to the server.

### GraphQL Sync (`src/lib/gql/sync.ts`)

The following sync functions must be updated:

- `syncAddWorkout` / `syncUpdateWorkout`: replace `exercises` field with `sections` serialized as JSON, or use a new `workout_sections` table (see DB schema below).
- `syncInsertWorkoutExercises`: replace flat `workout.exercises` traversal with iteration over `workout.sections.flatMap(s => s.exercises)`, adding a `section_id` foreign key to each row.
- Any direct references to `workout.exercises` (lines 95, 103 of `sync.ts`) must be updated.

### Hydration (`src/lib/gql/hydrate.ts`)

- `hydrateFromServer` currently assigns `exercises` from server data (line 147). After this change, it must reconstruct `sections` from the server response.
- Migration path applies here too: if server returns a workout with `exercises` but no `sections`, wrap them in a default "Main" section on the client side.

### DB Schema (Hasura DDN / Neon PostgreSQL)

New table `workout_sections`:
```sql
CREATE TABLE workout_sections (
  id        TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  position  INTEGER NOT NULL  -- array position for ordering
);
```

Add column to `workout_exercises`:
```sql
ALTER TABLE workout_exercises ADD COLUMN section_id TEXT REFERENCES workout_sections(id) ON DELETE CASCADE;
-- section_id is nullable to support legacy rows that predate sections
-- nullable rows are treated as belonging to a default "Main" section during hydration
```

Existing `workout_exercises` rows with `section_id IS NULL` are treated as belonging to a default "Main" section during hydration. The `migrateWorkout` utility handles this by creating a synthetic Main section and assigning all null-section exercises to it.

---

## Seeded Warmup Exercises

The following exercises in `src/data/exercises.ts` are updated to `exerciseType: 'warmup'` with `warmupDefaults`:

| Exercise | sets | reps | hint |
|---|---|---|---|
| Shoulder Dislocates (new) | 2 | 10-15 | Straight arms, slow and controlled |
| Scapular Push-ups (new) | 2 | 15 | Only scapular movement, arms straight |
| Jumping Jacks (new) | 2 | 20 | Light pace, full range of motion |
| Arm Circles (new) | 1 | 15 | Each direction |
| Hip Circles (new) | 1 | 10 | Each direction |
| Bodyweight Squat | 2 | 10 | Focus on depth and control |
| KB Deadlift | 2 | 8 | Use lighter weight than working sets |

New exercises are added as `exerciseType: 'warmup'` entries with full exercise metadata (category, movementPattern, equipment, focusAreas, difficulty, description, cues).

---

## Store Actions

### `src/store/useStore.ts`

#### New actions

```ts
// Exercise-level (global — mutates exercises array which is now persisted)
setExerciseType(exerciseId: string, type: ExerciseType): void
updateWarmupDefaults(exerciseId: string, defaults: WarmupDefaults): void

// Section management
addSection(workoutId: string, name: string): void
removeSection(workoutId: string, sectionId: string): void
renameSection(workoutId: string, sectionId: string, name: string): void
reorderSections(workoutId: string, orderedSectionIds: string[]): void
// reorderSections reconstructs sections array in the given ID order

// Exercise within section
// addExerciseToSection constructs WorkoutExercise internally (default sets, restSeconds, order)
// mirroring the logic currently in WorkoutsPage.tsx onAddExercise handler
addExerciseToSection(workoutId: string, sectionId: string, exercise: Exercise): void
removeExerciseFromSection(workoutId: string, sectionId: string, exerciseId: string): void

// UI state
toggleSectionCollapsed(sectionId: string): void
// mutates sectionCollapseState: Record<string, boolean> — not the Workout object
```

#### Modified actions

`updateSetData(workoutId, exerciseId, setIndex, data, sectionId)`, `toggleSetComplete(workoutId, exerciseId, setIndex, sectionId)`, `addSetToExercise(workoutId, exerciseId, sectionId)` each gain a `sectionId: string` parameter. The implementation finds the section by ID, then the exercise within it. If `sectionId` is not found, log a warning and no-op (do not throw).

All call sites in `WorkoutsPage.tsx` must pass `sectionId`.

#### Deprecated actions

`addExerciseToWorkout` and `removeExerciseFromWorkout` are removed. All call sites updated to use `addExerciseToSection` / `removeExerciseFromSection`.

#### Migration (both localStorage and server paths)

A `migrateWorkout(workout: any): Workout` utility function is created. It checks:
- If `workout.sections` exists → return as-is
- If `workout.exercises` exists → wrap in `[{ id: generateId(), name: "Main", exercises: workout.exercises }]`
- If neither → return with empty `[{ id: generateId(), name: "Warmup", exercises: [] }, { id: generateId(), name: "Main", exercises: [] }]`

This function is called:
1. In Zustand's `onRehydrateStorage` callback (localStorage path)
2. In `hydrateStore` after receiving server data (server path)

---

## UI Components

### Exercise Card (all exercises)

All exercise cards across the workout builder adopt the PDF-style layout.

**Default (collapsed) state:**
```
┌─────────────────────────────────────────┐
│ Exercise Name                    [✓] [✎]│
│ • Cue one                               │
│ • Cue two                               │
│ • Cue three                             │
│                          2 sets × 10-15 │
└─────────────────────────────────────────┘
```

- Name (bold)
- Cues as bullet list (from `exercise.cues`)
- `sets × reps` summary bottom-right (computed from the exercise's sets array)
- Completion checkbox top-right (marks all sets complete)
- Edit icon to enter edit mode

**Edit (expanded) state** — opens as bottom sheet or inline expansion:
```
┌─────────────────────────────────────────┐
│ Exercise Name                    [Done] │
│ Set 1:  [8] reps   [24] kg       [✓]   │
│ Set 2:  [8] reps   [24] kg       [✓]   │
│ Set 3:  [8] reps   [24] kg       [ ]   │
│                              [+ Set]   │
└─────────────────────────────────────────┘
```

- Per-set rows: reps input, weight input (if exercise uses weight), completion toggle
- Add set button
- Done button to collapse back

### Warmup Exercise Card

Minimal — no weight field, no per-set tracking, no edit mode.

```
┌─────────────────────────────────────────┐
│ [WARMUP] Exercise Name           [✓]   │
│ Hint text as primary cue                │
│ • Optional additional cue               │
│                            2 sets × 15 │
└─────────────────────────────────────────┘
```

- `WARMUP` badge/tag
- Hint from `warmupDefaults.hint` shown as primary cue
- Additional cues from `exercise.cues` if present
- `sets × reps` from `warmupDefaults`
- Single completion checkbox — no per-set editing

### Workout Sections

Each section renders as a labeled group with a header row:

```
▼ WARMUP                              [+] [⋮]
  [warmup card]
  [warmup card]
  [+ Add warmup exercise]

▼ MAIN                                [+] [⋮]
  [exercise card]
  [exercise card]
  [+ Add exercise]

[+ Add section]
```

- **Collapse/expand**: chevron on left of section name; state stored in `sectionCollapseState`
- **Rename**: tap section name → inline text input
- **Reorder**: drag handle on section header, drag-and-drop (library: `@dnd-kit/core` already used or to be added)
- **Add exercise**: `+` button in section header
- **Section menu** (⋮): Rename, Delete section (confirmation if non-empty: "This section has X exercises. Remove anyway?")
- **Add section**: `+ Add section` button below all sections

### "Add Warmup Exercise" Modal

Triggered by `+` in any Warmup-type section (or any section — the "add exercise" flow for non-warmup sections shows only main exercises by default).

**Part 1 — Warmup exercises list:**
- Lists all exercises where `exerciseType === 'warmup'`
- Shows name + `sets × reps` + hint
- Tap to add directly to section

**Part 2 — Regular exercises (expandable):**
- Collapsed by default: "Browse all exercises" toggle
- Lists `exerciseType === 'main'` exercises
- Selecting one shows inline prompt:
  - "Mark as warmup exercise (applies globally)"
  - Editable `sets`, `reps`, `hint` fields with sensible defaults
  - `[Mark as Warmup & Add]` button
  - Calls `setExerciseType(id, 'warmup')` + `updateWarmupDefaults(id, defaults)` + `addExerciseToSection()`

---

## Error Handling

- **Remove non-empty section**: confirmation dialog before deletion
- **Migration — no sections and no exercises**: initialize with default Warmup + Main sections
- **Warmup defaults missing**: fall back to `{ sets: 2, reps: "10", hint: "" }`
- **sectionId not found in modified actions**: log warning, no-op

---

## Testing Considerations

- Existing workouts (localStorage) migrate to sections structure on next load
- Existing workouts (server) migrate to sections structure on hydration
- `setExerciseType` and `updateWarmupDefaults` persist across page refresh
- Drag-and-drop section reorder updates array position correctly
- Warmup card renders with WARMUP badge and no edit mode
- Edit mode on main exercise card shows per-set rows with reps + weight
- Add warmup flow correctly marks exercise as warmup globally with warning
- `exercises` persisted array takes precedence over static `EXERCISES` import after user edits
