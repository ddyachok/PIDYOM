/**
 * Hydration: fetch all user data from Hasura Cloud v2 and populate the Zustand store.
 * Called once after authentication succeeds.
 */
import { gqlRequest } from './client';
import {
  GET_USER_PROFILE,
  GET_USER_WORKOUTS,
  GET_WORKOUT_EXERCISES,
  GET_EXERCISE_SETS,
  GET_USER_SCHEDULE,
  GET_USER_UNLOCKS,
} from './queries';
import { UPSERT_USER_PROFILE } from './mutations';
import { EXERCISES } from '../../data/exercises';
import type {
  Workout,
  WorkoutExercise,
  ExerciseSet,
  ScheduleEntry,
  Equipment,
} from '../types';

/** Parse array value from Hasura — handles both JSON arrays and PostgreSQL "{a,b}" strings */
function parseArrayField(val: string | string[] | null | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val.replace(/^\{|\}$/g, '').split(',').filter(Boolean);
  }
  return [];
}

interface HydratedData {
  profileId: number | null;
  userName: string;
  userEmail: string;
  userEquipment: Equipment[];
  workouts: Workout[];
  schedule: ScheduleEntry[];
  unlockedExercises: string[];
}

/**
 * Fetch all user data from the server and return it in store-compatible format.
 * Creates a profile if one doesn't exist yet.
 */
export async function hydrateFromServer(authUserId: string, email: string, name: string): Promise<HydratedData> {
  // 1. Get or create user profile
  const profile = await getOrCreateProfile(authUserId, email, name);

  if (!profile) {
    return {
      profileId: null,
      userName: name,
      userEmail: email,
      userEquipment: ['kettlebell', 'bodyweight'],
      workouts: [],
      schedule: [],
      unlockedExercises: EXERCISES.filter((e) => e.unlocked).map((e) => e.id),
    };
  }

  const userId = profile.id;

  // 2. Fetch all user data in parallel
  const [workoutsRes, scheduleRes, unlocksRes] = await Promise.all([
    gqlRequest<{ workouts: ServerWorkout[] }>(GET_USER_WORKOUTS, { userId }),
    gqlRequest<{ schedule_entries: ServerScheduleEntry[] }>(GET_USER_SCHEDULE, { userId }),
    gqlRequest<{ user_exercise_unlocks: { exercise_id: string }[] }>(GET_USER_UNLOCKS, { userId }),
  ]);

  // 3. Fetch workout exercises + sets
  const workoutIds = workoutsRes.workouts.map((w) => w.id);
  const workoutExercisesMap: Record<string, ServerWorkoutExercise[]> = {};
  const exerciseSetsMap: Record<string, ServerExerciseSet[]> = {};

  if (workoutIds.length > 0) {
    const weRes = await gqlRequest<{ workout_exercises: ServerWorkoutExercise[] }>(
      GET_WORKOUT_EXERCISES,
      { workoutIds }
    );

    for (const we of weRes.workout_exercises) {
      if (!workoutExercisesMap[we.workout_id]) workoutExercisesMap[we.workout_id] = [];
      workoutExercisesMap[we.workout_id].push(we);
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

  // 4. Transform server data to store format
  const workouts: Workout[] = workoutsRes.workouts.map((sw) => {
    const serverExercises = workoutExercisesMap[sw.id] || [];
    const exercises: WorkoutExercise[] = serverExercises
      .sort((a, b) => a.exercise_order - b.exercise_order)
      .map((swe) => {
        const exercise = EXERCISES.find((e) => e.id === swe.exercise_id);
        const serverSets = (exerciseSetsMap[swe.id] || []).sort(
          (a, b) => a.set_number - b.set_number
        );
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
          },
          sets,
          restSeconds: swe.rest_seconds ?? 60,
          notes: swe.notes ?? undefined,
          order: swe.exercise_order,
        };
      });

    return {
      id: sw.id,
      name: sw.name,
      type: sw.type as Workout['type'],
      date: sw.date,
      exercises,
      warmup: sw.warmup ?? undefined,
      notes: sw.notes ?? undefined,
      focusAreas: parseArrayField(sw.focus_areas) as Workout['focusAreas'],
      equipment: parseArrayField(sw.equipment) as Workout['equipment'],
      durationMinutes: sw.duration_minutes ?? undefined,
      completed: sw.completed ?? false,
      place: sw.place ?? undefined,
    };
  });

  const schedule: ScheduleEntry[] = scheduleRes.schedule_entries.map((se) => ({
    id: se.id,
    date: se.date,
    workoutId: se.workout_id ?? undefined,
    workoutType: se.workout_type as ScheduleEntry['workoutType'],
    completed: se.completed ?? false,
  }));

  const serverUnlocks = unlocksRes.user_exercise_unlocks.map((u) => u.exercise_id);
  const defaultUnlocks = EXERCISES.filter((e) => e.unlocked).map((e) => e.id);
  const unlockedExercises = [...new Set([...defaultUnlocks, ...serverUnlocks])];

  return {
    profileId: userId,
    userName: profile.name,
    userEmail: profile.email || email,
    userEquipment: parseArrayField(profile.equipment) as Equipment[],
    workouts,
    schedule,
    unlockedExercises,
  };
}

// ── Server types (raw from Hasura v2 — snake_case fields) ──

interface ServerProfile {
  id: number;
  auth_user_id: string;
  name: string;
  email: string | null;
  equipment: string[] | string | null;
}

interface ServerWorkout {
  id: string;
  name: string;
  type: string;
  date: string;
  completed: boolean | null;
  duration_minutes: number | null;
  equipment: string[] | string | null;
  focus_areas: string[] | string | null;
  notes: string | null;
  place: string | null;
  warmup: string | null;
  user_id: number;
}

interface ServerWorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_order: number;
  notes: string | null;
  rest_seconds: number | null;
}

interface ServerExerciseSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps: number;
  weight: string;
  completed: boolean | null;
  notes: string | null;
}

interface ServerScheduleEntry {
  id: string;
  date: string;
  workout_id: string | null;
  workout_type: string;
  completed: boolean | null;
  user_id: number;
}

async function getOrCreateProfile(
  authUserId: string,
  email: string,
  name: string
): Promise<ServerProfile | null> {
  try {
    const res = await gqlRequest<{ user_profiles: ServerProfile[] }>(GET_USER_PROFILE, {
      authUserId,
    });

    if (res.user_profiles.length > 0) {
      return res.user_profiles[0];
    }

    // Create new profile
    const insertRes = await gqlRequest<{
      insert_user_profiles: { returning: { id: number; auth_user_id: string }[] };
    }>(UPSERT_USER_PROFILE, {
      objects: [{ auth_user_id: authUserId, email, name }],
    });

    if (insertRes.insert_user_profiles.returning.length > 0) {
      const newId = insertRes.insert_user_profiles.returning[0].id;
      return { id: newId, auth_user_id: authUserId, name, email, equipment: null };
    }

    return null;
  } catch (err) {
    console.error('[PIDYOM hydrate] Failed to get/create profile:', err);
    return null;
  }
}
