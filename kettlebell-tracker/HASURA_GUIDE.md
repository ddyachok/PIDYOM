# PIDYOM — Setup & Run Guide

## Prerequisites

You already have installed:
- **Hasura DDN CLI** v3.9.4 (`ddn`)
- **Docker** 29.2.0
- **Node.js** + npm

---

## Step 1: Create Tables in Neon

Your Neon database connection string (from `.env`):
```
postgresql://neondb_owner:npg_BMige52pCvGZ@ep-plain-art-ag9lypls-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Open **Neon Console** → your project → **SQL Editor** at:
https://console.neon.tech/app/projects/bitter-glitter-39321941/branches/br-soft-hat-agkyslor/sql-editor

Paste and run these files **in order**:

1. Copy contents of `sql/001_create_tables.sql` → paste → **Run**
2. Copy contents of `sql/002_seed_exercises.sql` → paste → **Run**

This creates all tables (exercises, workouts, user_profiles, etc.) and seeds 45+ exercises.

> **Alternative — use psql from terminal:**
> ```bash
> # Install psql if needed: brew install libpq
> export DATABASE_URL="postgresql://neondb_owner:npg_BMige52pCvGZ@ep-plain-art-ag9lypls-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
> psql $DATABASE_URL -f kettlebell-tracker/sql/001_create_tables.sql
> psql $DATABASE_URL -f kettlebell-tracker/sql/002_seed_exercises.sql
> ```

---

## Step 2: Update Hasura DDN Metadata

After creating tables, Hasura needs to know about them.

```bash
cd /Users/danylodyachok/Dev/web/pidyom

# Introspect your Neon DB and update the connector schema
ddn connector introspect my_pg

# Add all new tables to Hasura metadata
ddn model add my_pg "*"

# Create a local Hasura DDN build
ddn supergraph build local
```

This generates `.hml` metadata files for each table (exercises, workouts, user_profiles, etc.).

---

## Step 3: Run Hasura DDN Locally

```bash
cd /Users/danylodyachok/Dev/web/pidyom

# Start the local Hasura engine + connector (requires Docker running)
ddn run docker-start
```

This starts:
- **Hasura Engine** at `http://localhost:3000` (GraphQL API)
- **Connector** at `http://localhost:8437` (PostgreSQL proxy)

Open the **local console** to explore your API:
```bash
ddn console --local
```

---

## Step 4: Run the Frontend

```bash
cd /Users/danylodyachok/Dev/web/pidyom/kettlebell-tracker

# Install dependencies (if not done)
npm install

# Start dev server
npx vite --host
```

Open http://localhost:5173 — you'll see the Auth page (powered by Neon Auth).

---

## Quick Reference: Adding Data

### Via Neon SQL Editor

Go to: https://console.neon.tech → SQL Editor

**Add a new exercise:**
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
  'kb-clean'  -- parent exercise (must already exist)
);
```

**Create a user profile (after signing up via Neon Auth):**
```sql
INSERT INTO user_profiles (auth_user_id, name, email, equipment)
VALUES (
  'neon-auth-user-id-here',
  'Danylo',
  'danylo@example.com',
  ARRAY['kettlebell', 'rings', 'bodyweight']::equipment_type[]
);
```

**Add a workout:**
```sql
INSERT INTO workouts (user_id, name, type, date, warmup, focus_areas, equipment)
VALUES (
  1,  -- user_profiles.id
  'Heavy Hinge Day',
  'A',
  '2025-06-01',
  'KB Halo x8 → Goblet Squat x5',
  ARRAY['strength', 'power']::focus_area[],
  ARRAY['kettlebell']::equipment_type[]
);
```

**Schedule workouts (Mon/Wed/Fri A-B pattern):**
```sql
INSERT INTO schedule_entries (user_id, date, workout_type) VALUES
  (1, '2025-06-02', 'A'),
  (1, '2025-06-04', 'B'),
  (1, '2025-06-06', 'A');
```

### Via Hasura Console (GraphQL)

After `ddn console --local`, use the API Explorer:

**Query all exercises:**
```graphql
query {
  exercises(order_by: { movementPattern: Asc }) {
    id
    name
    difficulty
    movementPattern
    progressionParentId
  }
}
```

**Add exercise via mutation:**
```graphql
mutation {
  insertExercises(objects: [{
    id: "kb-windmill"
    name: "Kettlebell Windmill"
    category: "grind"
    movementPattern: "core"
    equipment: "{kettlebell}"
    focusAreas: "{strength,mobility}"
    difficulty: "intermediate"
    description: "Overhead KB with lateral hip hinge"
    cues: "{\"Lock arm overhead\",\"Push hip out\",\"Reach to floor\"}"
    progressionParentId: "tgu-full"
  }]) {
    returning { id name }
  }
}
```

---

## Enum Values Reference

| Type | Values |
|------|--------|
| equipment_type | `kettlebell` `rings` `rope` `bodyweight` `pullup_bar` `parallettes` `resistance_band` |
| focus_area | `strength` `conditioning` `mobility` `power` `coordination` |
| workout_type | `A` `B` |
| exercise_category | `ballistic` `grind` `hybrid` |
| movement_pattern | `hinge` `squat` `push` `pull` `carry` `core` `flow` |
| difficulty_level | `beginner` `intermediate` `advanced` `elite` |

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  React Frontend │────▶│  Neon Auth        │     │ Neon         │
│  localhost:5173  │     │  (sign in/up)     │     │ PostgreSQL   │
│                  │     └──────────────────┘     │              │
│  Vite + React   │                               │ Tables:      │
│  + Tailwind     │──GraphQL──▶┌──────────┐──SQL──▶│ exercises    │
│  + Framer Motion│            │ Hasura   │       │ workouts     │
│  + Zustand      │◀───JSON────│ DDN v3   │◀──────│ user_profiles│
└─────────────────┘            │ :3000    │       │ schedule     │
                               └──────────┘       └─────────────┘
```

---

## Troubleshooting

**"Tables already exist" error when running SQL:**
Tables were already created. This is fine — skip to seeding or drop and recreate:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run both SQL files
```

**Hasura DDN can't connect to Neon:**
Check that `APP_MY_PG_JDBC_URL` in `.env` is correct and the Neon project is awake (Neon suspends idle databases — visit the console to wake it).

**Auth 404 errors:**
Make sure `VITE_NEON_AUTH_URL` in `kettlebell-tracker/.env` is set to:
```
https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech/neondb/auth
```

**Port 5173 already in use:**
```bash
lsof -i :5173    # find the PID
kill -9 <PID>    # kill it
```
