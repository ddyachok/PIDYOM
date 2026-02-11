// ==================== CORE TYPES ====================

export type WorkoutType = 'A' | 'B';
export type FocusArea = 'strength' | 'conditioning' | 'mobility' | 'power' | 'coordination';
export type Equipment = 'kettlebell' | 'rings' | 'rope' | 'bodyweight' | 'pullup_bar' | 'parallettes' | 'resistance_band';
export type ExerciseCategory = 'ballistic' | 'grind' | 'hybrid';
export type MovementPattern = 'hinge' | 'squat' | 'push' | 'pull' | 'carry' | 'core' | 'flow';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  equipment: Equipment[];
  focusAreas: FocusArea[];
  difficulty: DifficultyLevel;
  description: string;
  cues: string[];
  progressionParentId?: string;
  progressionChildren?: string[];
  unlocked: boolean;
}

export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  restSeconds: number;
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  date: string;
  exercises: WorkoutExercise[];
  warmup?: string;
  notes?: string;
  focusAreas: FocusArea[];
  equipment: Equipment[];
  durationMinutes?: number;
  completed: boolean;
  place?: string;
}

export interface ScheduleEntry {
  id: string;
  date: string;
  workoutId?: string;
  workoutType: WorkoutType;
  workout?: Workout;
  completed: boolean;
}

export interface ProgressionNode {
  exercise: Exercise;
  children: ProgressionNode[];
  unlocked: boolean;
  current: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  equipment: Equipment[];
  createdAt: string;
}

export interface ProgressMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
}

export interface WeeklyVolume {
  week: string;
  totalWeight: number;
  totalReps: number;
  totalSets: number;
  workoutCount: number;
}

export interface RadarDataPoint {
  label: string;
  value: number;
  fullMark: number;
}
