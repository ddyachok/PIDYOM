import { Workout, WorkoutType } from '../lib/types';

// Template workouts for A/B structure
export const WORKOUT_TEMPLATES: Record<string, Partial<Workout>> = {
  'strength-foundation': {
    name: 'Foundation',
    type: 'A' as WorkoutType,
    focusAreas: ['strength', 'mobility'],
    equipment: ['kettlebell', 'rings'],
    warmup: 'KB Halo x8 each way → Goblet Squat Prying x5 → Ring Support Hold 3x10s',
    notes: 'Focus on slow, strict reps. Own each position.',
  },
  'strength-upper': {
    name: 'Upper Control',
    type: 'A' as WorkoutType,
    focusAreas: ['strength'],
    equipment: ['kettlebell', 'rings', 'bodyweight'],
    warmup: 'Arm circles → Ring rows x5 → KB Halo x8',
    notes: 'Press and pull balance. Quality over quantity.',
  },
  'strength-lower': {
    name: 'Lower Strength',
    type: 'A' as WorkoutType,
    focusAreas: ['strength', 'mobility'],
    equipment: ['kettlebell', 'bodyweight'],
    warmup: 'Bodyweight squats x10 → Hip bridges x10 → KB Deadlift x5',
    notes: 'Deep positions. Patience in the hole.',
  },
  'conditioning-power': {
    name: 'Power Circuit',
    type: 'B' as WorkoutType,
    focusAreas: ['conditioning', 'power'],
    equipment: ['kettlebell', 'bodyweight'],
    warmup: 'Rope Flow 3min → Joint rotations → Light swings x20',
    notes: 'Rhythm and breathing. Controlled aggression.',
  },
  'conditioning-intervals': {
    name: 'Interval Work',
    type: 'B' as WorkoutType,
    focusAreas: ['conditioning', 'coordination'],
    equipment: ['kettlebell', 'rope', 'bodyweight'],
    warmup: 'Rope Flow 5min → Dynamic stretches',
    notes: 'Work:rest ratios. Keep heart rate in zone.',
  },
  'conditioning-flow': {
    name: 'Athletic Flow',
    type: 'B' as WorkoutType,
    focusAreas: ['conditioning', 'coordination', 'mobility'],
    equipment: ['kettlebell', 'rope', 'bodyweight'],
    warmup: 'Joint circles → Rope Flow 3min → Light KB complex',
    notes: 'Movement quality. Seamless transitions.',
  },
};

export const WORKOUT_TYPE_INFO = {
  A: {
    label: 'TYPE A',
    subtitle: 'STRENGTH & CONTROL',
    description: 'Gymnastic rings, calisthenics, kettlebells. Slow, strict reps. Technique, range of motion, progression.',
    focusAreas: ['strength', 'mobility'] as const,
    equipment: ['kettlebell', 'rings', 'bodyweight'] as const,
    color: '#e2e8f0',
  },
  B: {
    label: 'TYPE B',
    subtitle: 'CONDITIONING & POWER',
    description: 'Kettlebell power work, rope flow, sprinting intervals. Explosive bodyweight movements. Rhythm, breathing, coordination.',
    focusAreas: ['conditioning', 'power', 'coordination'] as const,
    equipment: ['kettlebell', 'rope', 'bodyweight'] as const,
    color: '#94a3b8',
  },
};

export function generateSchedule(startDate: Date, weeks: number = 4): Array<{ date: string; type: WorkoutType; dayOfWeek: string }> {
  const schedule: Array<{ date: string; type: WorkoutType; dayOfWeek: string }> = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const trainingDays = [1, 3, 5]; // Mon, Wed, Fri

  for (let week = 0; week < weeks; week++) {
    const isOddWeek = week % 2 === 0;
    const weekPattern: WorkoutType[] = isOddWeek ? ['A', 'B', 'A'] : ['B', 'A', 'B'];

    for (let dayIdx = 0; dayIdx < trainingDays.length; dayIdx++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (week * 7) + trainingDays[dayIdx] - startDate.getDay());
      if (date >= startDate) {
        schedule.push({
          date: date.toISOString().split('T')[0],
          type: weekPattern[dayIdx],
          dayOfWeek: days[date.getDay()],
        });
      }
    }
  }
  return schedule;
}
