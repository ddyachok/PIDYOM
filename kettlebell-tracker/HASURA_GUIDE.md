# PIDYOM - Hasura DB Content Management

## Setup

1. **Run migrations** on your Neon PostgreSQL database:
   ```bash
   psql $DATABASE_URL -f sql/001_create_tables.sql
   psql $DATABASE_URL -f sql/002_seed_exercises.sql
   ```

2. **Connect to Hasura DDN**: Add your Neon connection string in the Hasura DDN console under your connector configuration.

3. **Track tables** in Hasura: Go to your Hasura console → Data → Track all tables (exercises, workouts, user_profiles, etc.)

---

## Managing Content via SQL

### Add a New Exercise

```sql
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues, progression_parent_id)
VALUES (
  'kb-snatch',
  'Kettlebell Snatch',
  'ballistic',
  'hinge',
  ARRAY['kettlebell']::equipment_type[],
  ARRAY['power', 'conditioning']::focus_area[],
  'advanced',
  'Full-body explosive movement. KB from floor to overhead in one motion.',
  ARRAY['Hike the bell back', 'Punch through at the top', 'Soft lockout overhead'],
  'kb-clean'  -- parent exercise (must exist already)
);
```

### Add a New Equipment Type

If you need a new equipment type, alter the enum:
```sql
ALTER TYPE equipment_type ADD VALUE 'mace';
```

### Add a New Workout

```sql
INSERT INTO workouts (id, user_id, name, type, date, warmup, notes, focus_areas, equipment)
VALUES (
  gen_random_uuid()::text,
  1,  -- user_profiles.id
  'Heavy Day',
  'A',
  '2025-03-01',
  'KB Halo x8 → Goblet Squat x5',
  'Focus on slow reps with heavy bell',
  ARRAY['strength']::focus_area[],
  ARRAY['kettlebell']::equipment_type[]
);
```

### Add Exercises to a Workout

```sql
INSERT INTO workout_exercises (id, workout_id, exercise_id, rest_seconds, exercise_order)
VALUES (
  gen_random_uuid()::text,
  '<workout_id>',
  'kb-swing',
  60,
  1
);
```

### Add Sets to a Workout Exercise

```sql
INSERT INTO exercise_sets (id, workout_exercise_id, reps, weight, completed)
VALUES
  (gen_random_uuid()::text, '<workout_exercise_id>', 10, 24, false),
  (gen_random_uuid()::text, '<workout_exercise_id>', 10, 24, false),
  (gen_random_uuid()::text, '<workout_exercise_id>', 10, 24, false);
```

### Create a Progression Tree

Exercises form trees via `progression_parent_id`. To create a chain:

```sql
-- Root exercise (no parent)
INSERT INTO exercises (id, name, category, movement_pattern, equipment, difficulty, description)
VALUES ('deadlift-basic', 'Kettlebell Deadlift', 'grind', 'hinge', ARRAY['kettlebell']::equipment_type[], 'beginner', 'Foundation hinge pattern.');

-- Level 2 (child of root)
INSERT INTO exercises (id, name, category, movement_pattern, equipment, difficulty, progression_parent_id)
VALUES ('single-leg-dl', 'Single Leg Deadlift', 'grind', 'hinge', ARRAY['kettlebell']::equipment_type[], 'intermediate', 'deadlift-basic');

-- Level 3 (child of level 2)
INSERT INTO exercises (id, name, category, movement_pattern, equipment, difficulty, progression_parent_id)
VALUES ('pistol-dl', 'Pistol Deadlift', 'grind', 'hinge', ARRAY['kettlebell']::equipment_type[], 'advanced', 'single-leg-dl');
```

### Unlock an Exercise for a User

```sql
INSERT INTO user_exercise_unlocks (user_id, exercise_id)
VALUES (1, 'kb-clean')
ON CONFLICT DO NOTHING;
```

### Schedule Workouts

```sql
INSERT INTO schedule_entries (id, user_id, date, workout_type)
VALUES
  (gen_random_uuid()::text, 1, '2025-03-03', 'A'),
  (gen_random_uuid()::text, 1, '2025-03-05', 'B'),
  (gen_random_uuid()::text, 1, '2025-03-07', 'A');
```

---

## Managing Content via Hasura Console

1. Go to your Hasura DDN console
2. Navigate to **API Explorer**
3. Use GraphQL mutations:

### Add Exercise via GraphQL

```graphql
mutation {
  insert_exercises_one(object: {
    id: "kb-windmill"
    name: "Kettlebell Windmill"
    category: "grind"
    movement_pattern: "core"
    equipment: "{kettlebell}"
    focus_areas: "{strength,mobility}"
    difficulty: "intermediate"
    description: "Overhead KB with lateral hip hinge"
    cues: "{\"Lock arm overhead\",\"Push hip out\",\"Reach to floor\"}"
    progression_parent_id: "turkish-getup"
  }) {
    id
    name
  }
}
```

### Query All Exercises

```graphql
query {
  exercises(order_by: { movement_pattern: asc }) {
    id
    name
    difficulty
    movement_pattern
    progression_parent_id
  }
}
```

### Query Progression Tree

```graphql
query {
  exercises(where: { progression_parent_id: { _is_null: true }}) {
    id
    name
    children: exercises_by_progression_parent_id {
      id
      name
      children: exercises_by_progression_parent_id {
        id
        name
      }
    }
  }
}
```

---

## Enum Values Reference

| Type | Values |
|------|--------|
| equipment_type | kettlebell, rings, rope, bodyweight, pullup_bar, parallettes, resistance_band |
| focus_area | strength, conditioning, mobility, power, coordination |
| workout_type | A, B |
| exercise_category | ballistic, grind, hybrid |
| movement_pattern | hinge, squat, push, pull, carry, core, flow |
| difficulty_level | beginner, intermediate, advanced, elite |
