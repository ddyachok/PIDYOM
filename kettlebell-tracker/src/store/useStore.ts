import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workout, ScheduleEntry, Equipment, Exercise, WorkoutExercise, ExerciseSet, WorkoutType } from '../lib/types';
import { EXERCISES } from '../data/exercises';

interface AppState {
  // Auth (synced from Neon Auth session)
  isAuthenticated: boolean;
  userEmail: string;
  syncAuth: (authenticated: boolean, email: string, name: string) => void;

  // User
  userName: string;
  userEquipment: Equipment[];
  setUserName: (name: string) => void;
  setUserEquipment: (equipment: Equipment[]) => void;
  toggleEquipment: (eq: Equipment) => void;

  // Exercises
  exercises: Exercise[];
  unlockedExercises: string[];
  unlockExercise: (id: string) => void;
  isExerciseUnlocked: (id: string) => boolean;

  // Workouts
  workouts: Workout[];
  activeWorkoutId: string | null;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  setActiveWorkout: (id: string | null) => void;
  toggleSetComplete: (workoutId: string, exerciseId: string, setId: string) => void;
  updateSetData: (workoutId: string, exerciseId: string, setId: string, data: Partial<ExerciseSet>) => void;
  addExerciseToWorkout: (workoutId: string, exercise: WorkoutExercise) => void;
  removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => void;
  addSetToExercise: (workoutId: string, exerciseId: string) => void;
  completeWorkout: (id: string) => void;

  // Schedule
  schedule: ScheduleEntry[];
  addScheduleEntry: (entry: ScheduleEntry) => void;
  updateScheduleEntry: (id: string, updates: Partial<ScheduleEntry>) => void;
  removeScheduleEntry: (id: string) => void;

  // Navigation
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  // Glitch
  glitchActive: boolean;
  triggerGlitch: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth (synced from Neon Auth session)
      isAuthenticated: false,
      userEmail: '',
      syncAuth: (authenticated, email, name) => set({ isAuthenticated: authenticated, userEmail: email, userName: name }),

      // User
      userName: '',
      userEquipment: ['kettlebell', 'bodyweight'],
      setUserName: (name) => set({ userName: name }),
      setUserEquipment: (equipment) => set({ userEquipment: equipment }),
      toggleEquipment: (eq) => set((state) => ({
        userEquipment: state.userEquipment.includes(eq)
          ? state.userEquipment.filter(e => e !== eq)
          : [...state.userEquipment, eq],
      })),

      // Exercises
      exercises: EXERCISES,
      unlockedExercises: EXERCISES.filter(e => e.unlocked).map(e => e.id),
      unlockExercise: (id) => set((state) => ({
        unlockedExercises: [...new Set([...state.unlockedExercises, id])],
      })),
      isExerciseUnlocked: (id) => get().unlockedExercises.includes(id),

      // Workouts
      workouts: [],
      activeWorkoutId: null,
      addWorkout: (workout) => set((state) => ({
        workouts: [workout, ...state.workouts],
      })),
      updateWorkout: (id, updates) => set((state) => ({
        workouts: state.workouts.map(w => w.id === id ? { ...w, ...updates } : w),
      })),
      deleteWorkout: (id) => set((state) => ({
        workouts: state.workouts.filter(w => w.id !== id),
      })),
      setActiveWorkout: (id) => set({ activeWorkoutId: id }),
      toggleSetComplete: (workoutId, exerciseId, setId) => set((state) => ({
        workouts: state.workouts.map(w => {
          if (w.id !== workoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex;
              return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s),
              };
            }),
          };
        }),
      })),
      updateSetData: (workoutId, exerciseId, setId, data) => set((state) => ({
        workouts: state.workouts.map(w => {
          if (w.id !== workoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex;
              return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, ...data } : s),
              };
            }),
          };
        }),
      })),
      addExerciseToWorkout: (workoutId, exercise) => set((state) => ({
        workouts: state.workouts.map(w => {
          if (w.id !== workoutId) return w;
          return { ...w, exercises: [...w.exercises, exercise] };
        }),
      })),
      removeExerciseFromWorkout: (workoutId, exerciseId) => set((state) => ({
        workouts: state.workouts.map(w => {
          if (w.id !== workoutId) return w;
          return { ...w, exercises: w.exercises.filter(e => e.id !== exerciseId) };
        }),
      })),
      addSetToExercise: (workoutId, exerciseId) => set((state) => ({
        workouts: state.workouts.map(w => {
          if (w.id !== workoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex;
              const lastSet = ex.sets[ex.sets.length - 1];
              const newSet: ExerciseSet = {
                id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight || 16,
                completed: false,
              };
              return { ...ex, sets: [...ex.sets, newSet] };
            }),
          };
        }),
      })),
      completeWorkout: (id) => set((state) => ({
        workouts: state.workouts.map(w => w.id === id ? { ...w, completed: true } : w),
      })),

      // Schedule
      schedule: [],
      addScheduleEntry: (entry) => set((state) => ({
        schedule: [...state.schedule, entry],
      })),
      updateScheduleEntry: (id, updates) => set((state) => ({
        schedule: state.schedule.map(s => s.id === id ? { ...s, ...updates } : s),
      })),
      removeScheduleEntry: (id) => set((state) => ({
        schedule: state.schedule.filter(s => s.id !== id),
      })),

      // Navigation
      currentTab: 'home',
      setCurrentTab: (tab) => {
        get().triggerGlitch();
        set({ currentTab: tab });
      },

      // Glitch
      glitchActive: false,
      triggerGlitch: () => {
        set({ glitchActive: true });
        setTimeout(() => set({ glitchActive: false }), 300);
      },
    }),
    {
      name: 'pidyom-storage',
      partialize: (state) => ({
        userName: state.userName,
        userEmail: state.userEmail,
        userEquipment: state.userEquipment,
        unlockedExercises: state.unlockedExercises,
        workouts: state.workouts,
        schedule: state.schedule,
      }),
    }
  )
);
