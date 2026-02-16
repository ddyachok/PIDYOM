// GraphQL queries for Hasura Cloud v2 (snake_case field names)

export const GET_USER_PROFILE = `
  query GetUserProfile($authUserId: String!) {
    user_profiles(where: { auth_user_id: { _eq: $authUserId } }) {
      id
      auth_user_id
      name
      email
      equipment
      created_at
    }
  }
`;

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
      warmup
      user_id
    }
  }
`;

export const GET_WORKOUT_EXERCISES = `
  query GetWorkoutExercises($workoutIds: [String!]!) {
    workout_exercises(where: { workout_id: { _in: $workoutIds } }) {
      id
      workout_id
      exercise_id
      exercise_order
      notes
      rest_seconds
    }
  }
`;

export const GET_EXERCISE_SETS = `
  query GetExerciseSets($workoutExerciseIds: [String!]!) {
    exercise_sets(where: { workout_exercise_id: { _in: $workoutExerciseIds } }) {
      id
      workout_exercise_id
      set_number
      reps
      weight
      completed
      notes
    }
  }
`;

export const GET_USER_SCHEDULE = `
  query GetUserSchedule($userId: Int!) {
    schedule_entries(where: { user_id: { _eq: $userId } }, order_by: { date: asc }) {
      id
      date
      workout_id
      workout_type
      completed
      user_id
    }
  }
`;

export const GET_USER_UNLOCKS = `
  query GetUserUnlocks($userId: Int!) {
    user_exercise_unlocks(where: { user_id: { _eq: $userId } }) {
      id
      exercise_id
      user_id
    }
  }
`;

export const GET_ALL_EXERCISES = `
  query GetAllExercises {
    exercises {
      id
      name
      category
      movement_pattern
      equipment
      focus_areas
      difficulty
      description
      cues
      progression_parent_id
    }
  }
`;
