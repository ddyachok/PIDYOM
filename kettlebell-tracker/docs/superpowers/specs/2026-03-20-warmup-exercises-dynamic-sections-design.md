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
  collapsed: boolean
  order: number             // used for drag-and-drop reordering
}
```

#### Changes to `Exercise`

```ts
interface Exercise {
  // ...all existing fields unchanged...
  exerciseType: ExerciseType        // default: 'main'
  warmupDefaults?: WarmupDefaults   // required when exerciseType === 'warmup'
}
```

#### Changes to `Workout`

```ts
interface Workout {
  // Remove: exercises: WorkoutExercise[]
  // Add:
  sections: WorkoutSection[]
  // ...all other existing fields unchanged...
}
```

New workouts are initialized with two default sections:
1. `{ id: generateId(), name: "Warmup", order: 0, collapsed: false, exercises: [] }`
2. `{ id: generateId(), name: "Main", order: 1, collapsed: false, exercises: [] }`

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

New exercises (not currently in the data file) are added as `exerciseType: 'warmup'` entries with appropriate metadata.

---

## Store Actions

### `src/store/useStore.ts`

#### New actions

```ts
// Exercise-level (persist globally via exercises array + localStorage/Hasura sync)
setExerciseType(exerciseId: string, type: ExerciseType): void
updateWarmupDefaults(exerciseId: string, defaults: WarmupDefaults): void

// Section management
addSection(workoutId: string, name: string): void
removeSection(workoutId: string, sectionId: string): void
renameSection(workoutId: string, sectionId: string, name: string): void
reorderSections(workoutId: string, orderedSectionIds: string[]): void

// Exercise within section
addExerciseToSection(workoutId: string, sectionId: string, exercise: Exercise): void
removeExerciseFromSection(workoutId: string, sectionId: string, exerciseId: string): void
toggleSectionCollapsed(workoutId: string, sectionId: string): void
```

#### Modified actions

`updateSetData`, `toggleSetComplete`, `addSetToExercise` gain a `sectionId: string` parameter to identify which section's exercise array to target (replacing the flat `exercises` array lookup).

#### Migration

Existing workouts in localStorage that have `exercises: WorkoutExercise[]` are migrated on hydration: all exercises are moved into a single default section named "Main".

---

## UI Components

### Exercise Card (all exercises)

All exercise cards across the workout builder adopt the PDF-style layout.

**Default (collapsed) state:**
```
┌─────────────────────────────────────────┐
│ Exercise Name                    [✓] [⋮]│
│ • Cue one                               │
│ • Cue two                               │
│ • Cue three                             │
│                          2 sets × 10-15 │
└─────────────────────────────────────────┘
```

- Name (bold)
- Cues as bullet list (from `exercise.cues`)
- `sets × reps` summary bottom-right
- Completion checkbox top-right
- Edit icon (⋮ or pencil) to enter edit mode

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

More minimal than main exercise cards — no weight field, no per-set tracking.

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

- **Collapse/expand**: chevron on left of section name
- **Rename**: tap section name → inline text input
- **Reorder**: drag handle (⋮⋮) on section header, drag-and-drop
- **Add exercise**: `+` button in section header or `+ Add exercise` at bottom of section
- **Section menu** (⋮): options → Rename, Delete section (with confirmation if non-empty)
- **Add section**: `+ Add section` button below all sections

### "Add Warmup Exercise" Modal

Triggered by `+` in the Warmup section. Two-part layout:

**Part 1 — Warmup exercises list:**
- Lists all exercises where `exerciseType === 'warmup'`
- Shows name + `sets × reps` + hint
- Tap to add directly to section

**Part 2 — Regular exercises (expandable):**
- Collapsed by default: "Browse all exercises" toggle
- Lists `exerciseType === 'main'` exercises
- Selecting one shows inline prompt:
  - "Use as warmup exercise?"
  - Editable `sets`, `reps`, `hint` fields pre-filled with sensible defaults
  - `[Mark as Warmup & Add]` button
  - Calls `setExerciseType(id, 'warmup')` + `updateWarmupDefaults(id, defaults)` + `addExerciseToSection()`

---

## Error Handling

- **Remove non-empty section**: show confirmation dialog "This section has X exercises. Remove anyway?"
- **Migration failure**: if existing workout has no `sections`, fall back to wrapping `exercises` in a "Main" section
- **Warmup defaults missing**: if `exerciseType === 'warmup'` but `warmupDefaults` is undefined, fall back to `{ sets: 2, reps: "10", hint: "" }`

---

## Testing Considerations

- Existing workouts migrate correctly to sections structure
- `setExerciseType` persists across page refresh (localStorage)
- Drag-and-drop section reorder updates `order` correctly
- Warmup card renders with WARMUP badge and no weight field
- Edit mode on main exercise card shows per-set rows
- Add warmup flow correctly marks exercise as warmup globally
