-- PIDYOM Kettlebell Tracker Database Schema
-- For Hasura DDN + Neon PostgreSQL
-- Run this migration on your Neon database

-- Equipment enum type
CREATE TYPE equipment_type AS ENUM (
  'kettlebell', 'rings', 'rope', 'bodyweight',
  'pullup_bar', 'parallettes', 'resistance_band'
);

-- Focus area enum type
CREATE TYPE focus_area AS ENUM (
  'strength', 'conditioning', 'mobility', 'power', 'coordination'
);

-- Workout type enum
CREATE TYPE workout_type AS ENUM ('A', 'B');

-- Exercise category enum
CREATE TYPE exercise_category AS ENUM ('ballistic', 'grind', 'hybrid');

-- Movement pattern enum
CREATE TYPE movement_pattern AS ENUM (
  'hinge', 'squat', 'push', 'pull', 'carry', 'core', 'flow'
);

-- Difficulty level enum
CREATE TYPE difficulty_level AS ENUM (
  'beginner', 'intermediate', 'advanced', 'elite'
);

-- ==================== TABLES ====================

-- User profiles (extends Neon Auth users)
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  auth_user_id TEXT UNIQUE NOT NULL, -- Neon Auth user ID
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  equipment equipment_type[] DEFAULT ARRAY['kettlebell', 'bodyweight']::equipment_type[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises library
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category exercise_category NOT NULL,
  movement_pattern movement_pattern NOT NULL,
  equipment equipment_type[] NOT NULL DEFAULT '{}',
  focus_areas focus_area[] NOT NULL DEFAULT '{}',
  difficulty difficulty_level NOT NULL DEFAULT 'beginner',
  description TEXT DEFAULT '',
  cues TEXT[] DEFAULT '{}',
  progression_parent_id TEXT REFERENCES exercises(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User exercise unlocks (progression tracking)
CREATE TABLE user_exercise_unlocks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Workouts
CREATE TABLE workouts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type workout_type NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  warmup TEXT,
  notes TEXT,
  focus_areas focus_area[] DEFAULT '{}',
  equipment equipment_type[] DEFAULT '{}',
  duration_minutes INTEGER,
  place TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout exercises (exercises within a workout)
CREATE TABLE workout_exercises (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  exercise_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise sets (individual sets within a workout exercise)
CREATE TABLE exercise_sets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workout_exercise_id TEXT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL DEFAULT 0,
  weight DECIMAL(6,2) NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule entries
CREATE TABLE schedule_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_type workout_type NOT NULL,
  workout_id TEXT REFERENCES workouts(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ==================== INDEXES ====================

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workouts_type ON workouts(type);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_exercise_sets_workout_exercise_id ON exercise_sets(workout_exercise_id);
CREATE INDEX idx_schedule_entries_user_id ON schedule_entries(user_id);
CREATE INDEX idx_schedule_entries_date ON schedule_entries(date);
CREATE INDEX idx_user_exercise_unlocks_user_id ON user_exercise_unlocks(user_id);
CREATE INDEX idx_exercises_movement_pattern ON exercises(movement_pattern);
CREATE INDEX idx_exercises_category ON exercises(category);

-- ==================== UPDATED_AT TRIGGER ====================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
