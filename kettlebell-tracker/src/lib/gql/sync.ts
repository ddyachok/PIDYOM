/**
 * Fire-and-forget sync functions for Hasura Cloud v2.
 * Each function sends a mutation in the background.
 * Errors are logged but never block the UI.
 */
import { gqlRequest } from './client';
import {
  INSERT_WORKOUT,
  UPDATE_WORKOUT,
  DELETE_WORKOUT,
  INSERT_WORKOUT_EXERCISES,
  DELETE_WORKOUT_EXERCISES,
  INSERT_EXERCISE_SETS,
  UPDATE_EXERCISE_SET,
  DELETE_EXERCISE_SETS,
  INSERT_SCHEDULE_ENTRY,
  UPDATE_SCHEDULE_ENTRY,
  DELETE_SCHEDULE_ENTRY,
  INSERT_EXERCISE_UNLOCK,
  UPDATE_USER_PROFILE,
  UPSERT_USER_PROFILE,
} from './mutations';
import type { Workout, WorkoutExercise, ScheduleEntry, Equipment } from '../types';

// Hasura Cloud v2 accepts JSON arrays directly for array columns via variables

function fire(promise: Promise<unknown>) {
  promise.catch((err) => console.error('[PIDYOM sync]', err));
}

// ── User Profile ──

export function syncEnsureProfile(authUserId: string, email: string, name: string) {
  fire(
    gqlRequest(UPSERT_USER_PROFILE, {
      objects: [{ auth_user_id: authUserId, email, name }],
    })
  );
}

export function syncUpdateEquipment(authUserId: string, equipment: Equipment[]) {
  fire(
    gqlRequest(UPDATE_USER_PROFILE, {
      where: { auth_user_id: { _eq: authUserId } },
      _set: { equipment: equipment },
    })
  );
}

export function syncUpdateUserName(authUserId: string, name: string) {
  fire(
    gqlRequest(UPDATE_USER_PROFILE, {
      where: { auth_user_id: { _eq: authUserId } },
      _set: { name },
    })
  );
}

// ── Workouts ──

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
          warmup: workout.warmup ?? null,
        },
      ],
    }).then(() => {
      if (workout.exercises.length > 0) {
        syncInsertWorkoutExercises(workout.id, workout.exercises);
      }
    })
  );
}

function syncInsertWorkoutExercises(workoutId: string, exercises: WorkoutExercise[]) {
  const weObjects = exercises.map((ex) => ({
    id: ex.id,
    workout_id: workoutId,
    exercise_id: ex.exerciseId,
    exercise_order: ex.order,
    notes: ex.notes ?? null,
    rest_seconds: ex.restSeconds,
  }));

  fire(
    gqlRequest(INSERT_WORKOUT_EXERCISES, { objects: weObjects }).then(() => {
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
    })
  );
}

export function syncUpdateWorkout(workoutId: string, updates: Partial<Workout>) {
  const _set: Record<string, unknown> = {};
  if (updates.name !== undefined) _set.name = updates.name;
  if (updates.completed !== undefined) _set.completed = updates.completed;
  if (updates.durationMinutes !== undefined) _set.duration_minutes = updates.durationMinutes;
  if (updates.notes !== undefined) _set.notes = updates.notes;
  if (updates.place !== undefined) _set.place = updates.place;
  if (updates.warmup !== undefined) _set.warmup = updates.warmup;
  if (updates.equipment) _set.equipment = updates.equipment;
  if (updates.focusAreas) _set.focus_areas = updates.focusAreas;

  if (Object.keys(_set).length > 0) {
    fire(gqlRequest(UPDATE_WORKOUT, { where: { id: { _eq: workoutId } }, _set }));
  }
}

export function syncDeleteWorkout(workoutId: string) {
  // DB has ON DELETE CASCADE on foreign keys, so just delete the workout
  fire(
    gqlRequest(DELETE_WORKOUT, { where: { id: { _eq: workoutId } } })
  );
}

export function syncCompleteWorkout(workoutId: string) {
  fire(
    gqlRequest(UPDATE_WORKOUT, {
      where: { id: { _eq: workoutId } },
      _set: { completed: true },
    })
  );
}

// ── Exercise within workout ──

export function syncAddExerciseToWorkout(workoutId: string, exercise: WorkoutExercise) {
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

export function syncRemoveExerciseFromWorkout(exerciseId: string) {
  // Delete sets first, then the workout exercise
  fire(
    gqlRequest(DELETE_EXERCISE_SETS, {
      where: { workout_exercise_id: { _eq: exerciseId } },
    }).then(() =>
      gqlRequest(DELETE_WORKOUT_EXERCISES, {
        where: { id: { _eq: exerciseId } },
      })
    )
  );
}

// ── Sets ──

export function syncAddSet(workoutExerciseId: string, setId: string, reps: number, weight: number, setNumber: number) {
  fire(
    gqlRequest(INSERT_EXERCISE_SETS, {
      objects: [
        {
          id: setId,
          workout_exercise_id: workoutExerciseId,
          set_number: setNumber,
          reps,
          weight,
          completed: false,
        },
      ],
    })
  );
}

export function syncToggleSetComplete(setId: string, completed: boolean) {
  fire(
    gqlRequest(UPDATE_EXERCISE_SET, {
      where: { id: { _eq: setId } },
      _set: { completed },
    })
  );
}

export function syncUpdateSetData(setId: string, data: { reps?: number; weight?: number; notes?: string }) {
  const _set: Record<string, unknown> = {};
  if (data.reps !== undefined) _set.reps = data.reps;
  if (data.weight !== undefined) _set.weight = data.weight;
  if (data.notes !== undefined) _set.notes = data.notes;

  if (Object.keys(_set).length > 0) {
    fire(gqlRequest(UPDATE_EXERCISE_SET, { where: { id: { _eq: setId } }, _set }));
  }
}

// ── Schedule ──

export function syncAddScheduleEntry(entry: ScheduleEntry, userId: number) {
  fire(
    gqlRequest(INSERT_SCHEDULE_ENTRY, {
      objects: [
        {
          id: entry.id,
          date: entry.date,
          workout_type: entry.workoutType,
          workout_id: entry.workoutId ?? null,
          completed: entry.completed,
          user_id: userId,
        },
      ],
    })
  );
}

export function syncUpdateScheduleEntry(entryId: string, updates: Partial<ScheduleEntry>) {
  const _set: Record<string, unknown> = {};
  if (updates.date !== undefined) _set.date = updates.date;
  if (updates.workoutType !== undefined) _set.workout_type = updates.workoutType;
  if (updates.workoutId !== undefined) _set.workout_id = updates.workoutId;
  if (updates.completed !== undefined) _set.completed = updates.completed;

  if (Object.keys(_set).length > 0) {
    fire(gqlRequest(UPDATE_SCHEDULE_ENTRY, { where: { id: { _eq: entryId } }, _set }));
  }
}

export function syncRemoveScheduleEntry(entryId: string) {
  fire(
    gqlRequest(DELETE_SCHEDULE_ENTRY, { where: { id: { _eq: entryId } } })
  );
}

// ── Exercise Unlocks ──

export function syncUnlockExercise(exerciseId: string, userId: number) {
  fire(
    gqlRequest(INSERT_EXERCISE_UNLOCK, {
      objects: [{ exercise_id: exerciseId, user_id: userId }],
    })
  );
}
