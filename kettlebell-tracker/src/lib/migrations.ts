// src/lib/migrations.ts
import type { Workout, WorkoutSection } from './types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Migrates a workout from any historical shape to the current WorkoutSection shape.
 * Safe to call on already-migrated workouts (no-op if sections exists).
 * Note: the old `warmup?: string` field is intentionally discarded during migration.
 */
export function migrateWorkout(raw: any): Workout {
  // Already migrated
  if (raw.sections && Array.isArray(raw.sections)) {
    return raw as Workout;
  }

  // Old shape: flat exercises array — wrap in a Main section
  if (raw.exercises && Array.isArray(raw.exercises)) {
    const mainSection: WorkoutSection = {
      id: generateId(),
      name: 'Main',
      exercises: raw.exercises,
    };
    const { exercises, warmup, ...rest } = raw;
    return { ...rest, sections: [mainSection] } as Workout;
  }

  // No exercises at all — initialize with default Warmup + Main sections
  const { warmup, ...rest } = raw;
  return {
    ...rest,
    sections: [
      { id: generateId(), name: 'Warmup', exercises: [] },
      { id: generateId(), name: 'Main', exercises: [] },
    ],
  } as Workout;
}
