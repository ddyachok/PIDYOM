// GraphQL mutations for Hasura Cloud v2 (snake_case, _set syntax)

// ── User Profile ──
export const UPSERT_USER_PROFILE = `
  mutation UpsertUserProfile($objects: [user_profiles_insert_input!]!) {
    insert_user_profiles(objects: $objects, on_conflict: { constraint: user_profiles_auth_user_id_key, update_columns: [name, email] }) {
      affected_rows
      returning {
        id
        auth_user_id
      }
    }
  }
`;

export const UPDATE_USER_PROFILE = `
  mutation UpdateUserProfile($where: user_profiles_bool_exp!, $_set: user_profiles_set_input!) {
    update_user_profiles(where: $where, _set: $_set) {
      affected_rows
    }
  }
`;

// ── Workouts ──
export const INSERT_WORKOUT = `
  mutation InsertWorkout($objects: [workouts_insert_input!]!) {
    insert_workouts(objects: $objects) {
      affected_rows
    }
  }
`;

export const UPDATE_WORKOUT = `
  mutation UpdateWorkout($where: workouts_bool_exp!, $_set: workouts_set_input!) {
    update_workouts(where: $where, _set: $_set) {
      affected_rows
    }
  }
`;

export const DELETE_WORKOUT = `
  mutation DeleteWorkout($where: workouts_bool_exp!) {
    delete_workouts(where: $where) {
      affected_rows
    }
  }
`;

// ── Workout Exercises ──
export const INSERT_WORKOUT_EXERCISES = `
  mutation InsertWorkoutExercises($objects: [workout_exercises_insert_input!]!) {
    insert_workout_exercises(objects: $objects) {
      affected_rows
    }
  }
`;

export const DELETE_WORKOUT_EXERCISES = `
  mutation DeleteWorkoutExercises($where: workout_exercises_bool_exp!) {
    delete_workout_exercises(where: $where) {
      affected_rows
    }
  }
`;

// ── Exercise Sets ──
export const INSERT_EXERCISE_SETS = `
  mutation InsertExerciseSets($objects: [exercise_sets_insert_input!]!) {
    insert_exercise_sets(objects: $objects) {
      affected_rows
    }
  }
`;

export const UPDATE_EXERCISE_SET = `
  mutation UpdateExerciseSet($where: exercise_sets_bool_exp!, $_set: exercise_sets_set_input!) {
    update_exercise_sets(where: $where, _set: $_set) {
      affected_rows
    }
  }
`;

export const DELETE_EXERCISE_SETS = `
  mutation DeleteExerciseSets($where: exercise_sets_bool_exp!) {
    delete_exercise_sets(where: $where) {
      affected_rows
    }
  }
`;

// ── Schedule Entries ──
export const INSERT_SCHEDULE_ENTRY = `
  mutation InsertScheduleEntry($objects: [schedule_entries_insert_input!]!) {
    insert_schedule_entries(objects: $objects) {
      affected_rows
    }
  }
`;

export const UPDATE_SCHEDULE_ENTRY = `
  mutation UpdateScheduleEntry($where: schedule_entries_bool_exp!, $_set: schedule_entries_set_input!) {
    update_schedule_entries(where: $where, _set: $_set) {
      affected_rows
    }
  }
`;

export const DELETE_SCHEDULE_ENTRY = `
  mutation DeleteScheduleEntry($where: schedule_entries_bool_exp!) {
    delete_schedule_entries(where: $where) {
      affected_rows
    }
  }
`;

// ── Exercise Unlocks ──
export const INSERT_EXERCISE_UNLOCK = `
  mutation InsertExerciseUnlock($objects: [user_exercise_unlocks_insert_input!]!) {
    insert_user_exercise_unlocks(objects: $objects) {
      affected_rows
    }
  }
`;
