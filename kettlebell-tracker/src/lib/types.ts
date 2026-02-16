// ==================== CORE TYPES ====================

export type WorkoutType = 'A' | 'B'; // Legacy — kept for DB compat, mapped from TrainingGoal
export type TrainingGoal = 'strength' | 'conditioning' | 'mobility' | 'power' | 'skill';
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
  type: WorkoutType; // Legacy DB field — maps to/from trainingGoal
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
  workoutType: WorkoutType; // Legacy DB field
  workout?: Workout;
  completed: boolean;
}

/** Maps TrainingGoal to legacy WorkoutType for DB storage */
export function goalToType(goal: TrainingGoal): WorkoutType {
  return goal === 'strength' || goal === 'mobility' ? 'A' : 'B';
}

/** Maps legacy WorkoutType to TrainingGoal */
export function typeToGoal(type: WorkoutType): TrainingGoal {
  return type === 'A' ? 'strength' : 'conditioning';
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

export const TRAINING_GOAL_INFO: Record<TrainingGoal, { label: string; description: string; color: string }> = {
  strength: { label: 'STRENGTH', description: 'Strict reps. Own each position.', color: '#ff9500' },
  conditioning: { label: 'CONDITIONING', description: 'Rhythm, breathing, endurance.', color: '#00d9ff' },
  mobility: { label: 'MOBILITY', description: 'Range of motion. Patience.', color: '#22c55e' },
  power: { label: 'POWER', description: 'Explosive. Controlled aggression.', color: '#ef4444' },
  skill: { label: 'SKILL', description: 'Movement quality. Seamless transitions.', color: '#a855f7' },
};
