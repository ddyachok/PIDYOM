import { Workout, WorkoutType, TrainingGoal, goalToType } from '../lib/types';

// ── Templates with pre-defined exercises ──

export interface WorkoutTemplate {
  name: string;
  trainingGoal: TrainingGoal;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  focusAreas: string[];
  equipment: string[];
  warmup?: string;
  notes?: string;
  /** Exercise IDs to pre-populate */
  exerciseIds: string[];
  /** Default sets per exercise */
  defaultSets: number;
  /** Default reps per set */
  defaultReps: number;
  /** Default weight */
  defaultWeight: number;
}

export const WORKOUT_TEMPLATES: Record<string, WorkoutTemplate> = {
  'foundation': {
    name: 'Foundation',
    trainingGoal: 'strength',
    difficulty: 'beginner',
    durationMinutes: 30,
    focusAreas: ['strength', 'mobility'],
    equipment: ['kettlebell'],
    warmup: 'KB Halo x8 each way → Goblet Squat Prying x5',
    notes: 'Focus on slow, strict reps. Own each position.',
    exerciseIds: ['goblet-squat', 'kb-press', 'kb-row'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 16,
  },
  'upper-control': {
    name: 'Upper Control',
    trainingGoal: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 40,
    focusAreas: ['strength'],
    equipment: ['kettlebell', 'rings', 'bodyweight'],
    warmup: 'Arm circles → Ring rows x5 → KB Halo x8',
    notes: 'Press and pull balance. Quality over quantity.',
    exerciseIds: ['ring-row', 'ring-dip', 'kb-press'],
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 16,
  },
  'lower-power': {
    name: 'Lower Power',
    trainingGoal: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 35,
    focusAreas: ['strength', 'mobility'],
    equipment: ['kettlebell', 'bodyweight'],
    warmup: 'Bodyweight squats x10 → Hip bridges x10 → KB Deadlift x5',
    notes: 'Deep positions. Patience in the hole.',
    exerciseIds: ['kb-deadlift', 'goblet-squat', 'kb-two-hand-swing'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 20,
  },
  'power-circuit': {
    name: 'Power Circuit',
    trainingGoal: 'conditioning',
    difficulty: 'intermediate',
    durationMinutes: 30,
    focusAreas: ['conditioning', 'power'],
    equipment: ['kettlebell', 'bodyweight'],
    warmup: 'Joint rotations → Light swings x20',
    notes: 'Rhythm and breathing. Controlled aggression.',
    exerciseIds: ['kb-two-hand-swing', 'kb-clean', 'kb-snatch'],
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 16,
  },
  'interval-burn': {
    name: 'Interval Burn',
    trainingGoal: 'conditioning',
    difficulty: 'intermediate',
    durationMinutes: 25,
    focusAreas: ['conditioning', 'coordination'],
    equipment: ['kettlebell', 'rope', 'bodyweight'],
    warmup: 'Rope Flow 5min → Dynamic stretches',
    notes: 'Work:rest ratios. Keep heart rate in zone.',
    exerciseIds: ['kb-snatch', 'kb-two-hand-swing'],
    defaultSets: 5,
    defaultReps: 12,
    defaultWeight: 16,
  },
  'athletic-flow': {
    name: 'Athletic Flow',
    trainingGoal: 'skill',
    difficulty: 'advanced',
    durationMinutes: 40,
    focusAreas: ['conditioning', 'coordination', 'mobility'],
    equipment: ['kettlebell', 'rope', 'bodyweight'],
    warmup: 'Joint circles → Rope Flow 3min → Light KB complex',
    notes: 'Movement quality. Seamless transitions.',
    exerciseIds: ['turkish-getup', 'kb-windmill'],
    defaultSets: 3,
    defaultReps: 5,
    defaultWeight: 12,
  },
  'mobility-session': {
    name: 'Mobility Session',
    trainingGoal: 'mobility',
    difficulty: 'beginner',
    durationMinutes: 25,
    focusAreas: ['mobility'],
    equipment: ['kettlebell', 'bodyweight'],
    warmup: 'Full body joint circles',
    notes: 'Range of motion is the goal. Breathe deep.',
    exerciseIds: ['kb-windmill', 'kb-halo', 'goblet-squat'],
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 8,
  },
  'skill-builder': {
    name: 'Skill Builder',
    trainingGoal: 'skill',
    difficulty: 'advanced',
    durationMinutes: 45,
    focusAreas: ['coordination', 'strength'],
    equipment: ['kettlebell', 'bodyweight'],
    warmup: 'TGU walkthrough x2 each side → Light presses',
    notes: 'Precision work. Every rep intentional.',
    exerciseIds: ['turkish-getup', 'kb-bottoms-up-press'],
    defaultSets: 3,
    defaultReps: 5,
    defaultWeight: 12,
  },
};

// ── Legacy WORKOUT_TYPE_INFO — still used for DB backwards compat ──

export const WORKOUT_TYPE_INFO = {
  A: {
    label: 'STRENGTH',
    subtitle: 'STRENGTH & CONTROL',
    description: 'Gymnastic rings, calisthenics, kettlebells. Slow, strict reps.',
    focusAreas: ['strength', 'mobility'] as const,
    equipment: ['kettlebell', 'rings', 'bodyweight'] as const,
    color: '#ff9500',
  },
  B: {
    label: 'CONDITIONING',
    subtitle: 'CONDITIONING & POWER',
    description: 'Kettlebell power work, rope flow, explosive movements.',
    focusAreas: ['conditioning', 'power', 'coordination'] as const,
    equipment: ['kettlebell', 'rope', 'bodyweight'] as const,
    color: '#00d9ff',
  },
};

export function generateSchedule(startDate: Date, weeks: number = 4): Array<{ date: string; type: WorkoutType; dayOfWeek: string }> {
  const schedule: Array<{ date: string; type: WorkoutType; dayOfWeek: string }> = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const trainingDays = [1, 3, 5]; // Mon, Wed, Fri

  // Rotate through training goals
  const goalPattern: TrainingGoal[] = ['strength', 'conditioning', 'strength', 'power', 'conditioning', 'mobility'];

  for (let week = 0; week < weeks; week++) {
    for (let dayIdx = 0; dayIdx < trainingDays.length; dayIdx++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (week * 7) + trainingDays[dayIdx] - startDate.getDay());
      if (date >= startDate) {
        const goalIdx = (week * 3 + dayIdx) % goalPattern.length;
        schedule.push({
          date: date.toISOString().split('T')[0],
          type: goalToType(goalPattern[goalIdx]),
          dayOfWeek: days[date.getDay()],
        });
      }
    }
  }
  return schedule;
}
