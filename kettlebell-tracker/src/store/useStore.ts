import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workout, ScheduleEntry, Equipment, Exercise, WorkoutExercise, ExerciseSet, WorkoutType } from '../lib/types';
import { EXERCISES } from '../data/exercises';
import {
  syncAddWorkout,
  syncUpdateWorkout,
  syncDeleteWorkout,
  syncCompleteWorkout,
  syncAddExerciseToWorkout,
  syncRemoveExerciseFromWorkout,
  syncAddSet,
  syncToggleSetComplete,
  syncUpdateSetData,
  syncAddScheduleEntry,
  syncUpdateScheduleEntry,
  syncRemoveScheduleEntry,
  syncUnlockExercise,
  syncUpdateEquipment,
  syncUpdateUserName,
} from '../lib/gql/sync';

interface AppState {
  // Auth (synced from Neon Auth session)
  isAuthenticated: boolean;
  userEmail: string;
  authUserId: string;
  syncAuth: (authenticated: boolean, email: string, name: string, authUserId?: string) => void;

  // Server profile
  profileId: number | null;
  isHydrated: boolean;
  hydrateStore: (data: {
    profileId: number | null;
    userName: string;
    userEmail: string;
    userEquipment: Equipment[];
    workouts: Workout[];
    schedule: ScheduleEntry[];
    unlockedExercises: string[];
  }) => void;

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
      authUserId: '',
      syncAuth: (authenticated, email, name, authUserId) => {
        const prev = get();
        if (authenticated && authUserId) {
          // Switching to a different user → clear stale data
          if (prev.authUserId && prev.authUserId !== authUserId) {
            set({
              isAuthenticated: true,
              userEmail: email,
              userName: name,
              authUserId,
              profileId: null,
              isHydrated: false,
              workouts: [],
              schedule: [],
              unlockedExercises: EXERCISES.filter(e => e.unlocked).map(e => e.id),
              userEquipment: ['kettlebell', 'bodyweight'],
            });
          } else {
            set({
              isAuthenticated: true,
              userEmail: email,
              userName: name,
              authUserId,
            });
          }
        } else if (!authenticated) {
          // Logged out → clear all user data
          set({
            isAuthenticated: false,
            userEmail: '',
            userName: '',
            authUserId: '',
            profileId: null,
            isHydrated: false,
            workouts: [],
            schedule: [],
            unlockedExercises: EXERCISES.filter(e => e.unlocked).map(e => e.id),
            userEquipment: ['kettlebell', 'bodyweight'],
          });
        }
      },

      // Server profile
      profileId: null,
      isHydrated: false,
      hydrateStore: (data) => set({
        profileId: data.profileId,
        userName: data.userName,
        userEmail: data.userEmail,
        userEquipment: data.userEquipment.length > 0 ? data.userEquipment : ['kettlebell', 'bodyweight'],
        workouts: data.workouts,
        schedule: data.schedule,
        unlockedExercises: data.unlockedExercises,
        isHydrated: true,
      }),

      // User
      userName: '',
      userEquipment: ['kettlebell', 'bodyweight'],
      setUserName: (name) => {
        set({ userName: name });
        const { authUserId } = get();
        if (authUserId) syncUpdateUserName(authUserId, name);
      },
      setUserEquipment: (equipment) => {
        set({ userEquipment: equipment });
        const { authUserId } = get();
        if (authUserId) syncUpdateEquipment(authUserId, equipment);
      },
      toggleEquipment: (eq) => {
        const state = get();
        const newEquipment = state.userEquipment.includes(eq)
          ? state.userEquipment.filter(e => e !== eq)
          : [...state.userEquipment, eq];
        set({ userEquipment: newEquipment });
        if (state.authUserId) syncUpdateEquipment(state.authUserId, newEquipment);
      },

      // Exercises
      exercises: EXERCISES,
      unlockedExercises: EXERCISES.filter(e => e.unlocked).map(e => e.id),
      unlockExercise: (id) => {
        set((state) => ({
          unlockedExercises: [...new Set([...state.unlockedExercises, id])],
        }));
        const { profileId } = get();
        if (profileId) syncUnlockExercise(id, profileId);
      },
      isExerciseUnlocked: (id) => get().unlockedExercises.includes(id),

      // Workouts
      workouts: [],
      activeWorkoutId: null,
      addWorkout: (workout) => {
        set((state) => ({ workouts: [workout, ...state.workouts] }));
        const { profileId } = get();
        if (profileId) syncAddWorkout(workout, profileId);
      },
      updateWorkout: (id, updates) => {
        set((state) => ({
          workouts: state.workouts.map(w => w.id === id ? { ...w, ...updates } : w),
        }));
        syncUpdateWorkout(id, updates);
      },
      deleteWorkout: (id) => {
        set((state) => ({ workouts: state.workouts.filter(w => w.id !== id) }));
        syncDeleteWorkout(id);
      },
      setActiveWorkout: (id) => set({ activeWorkoutId: id }),
      toggleSetComplete: (workoutId, exerciseId, setId) => {
        const state = get();
        const workout = state.workouts.find(w => w.id === workoutId);
        const exercise = workout?.exercises.find(ex => ex.id === exerciseId);
        const setItem = exercise?.sets.find(s => s.id === setId);
        const newCompleted = !(setItem?.completed);

        set((state) => ({
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
        }));
        syncToggleSetComplete(setId, newCompleted);
      },
      updateSetData: (workoutId, exerciseId, setId, data) => {
        set((state) => ({
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
        }));
        syncUpdateSetData(setId, data);
      },
      addExerciseToWorkout: (workoutId, exercise) => {
        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return { ...w, exercises: [...w.exercises, exercise] };
          }),
        }));
        syncAddExerciseToWorkout(workoutId, exercise);
      },
      removeExerciseFromWorkout: (workoutId, exerciseId) => {
        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return { ...w, exercises: w.exercises.filter(e => e.id !== exerciseId) };
          }),
        }));
        syncRemoveExerciseFromWorkout(exerciseId);
      },
      addSetToExercise: (workoutId, exerciseId) => {
        let newSetId = '';
        set((state) => ({
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
                newSetId = newSet.id;
                syncAddSet(exerciseId, newSet.id, newSet.reps, newSet.weight, ex.sets.length + 1);
                return { ...ex, sets: [...ex.sets, newSet] };
              }),
            };
          }),
        }));
      },
      completeWorkout: (id) => {
        set((state) => ({
          workouts: state.workouts.map(w => w.id === id ? { ...w, completed: true } : w),
        }));
        syncCompleteWorkout(id);
      },

      // Schedule
      schedule: [],
      addScheduleEntry: (entry) => {
        set((state) => ({ schedule: [...state.schedule, entry] }));
        const { profileId } = get();
        if (profileId) syncAddScheduleEntry(entry, profileId);
      },
      updateScheduleEntry: (id, updates) => {
        set((state) => ({
          schedule: state.schedule.map(s => s.id === id ? { ...s, ...updates } : s),
        }));
        syncUpdateScheduleEntry(id, updates);
      },
      removeScheduleEntry: (id) => {
        set((state) => ({ schedule: state.schedule.filter(s => s.id !== id) }));
        syncRemoveScheduleEntry(id);
      },

      // Navigation
      currentTab: 'home',
      setCurrentTab: (tab) => {
        set({ currentTab: tab });
      },

      // Glitch (deprecated — no-op)
      glitchActive: false,
      triggerGlitch: () => {},
    }),
    {
      name: 'pidyom-storage',
      partialize: (state) => ({
        userName: state.userName,
        userEmail: state.userEmail,
        authUserId: state.authUserId,
        profileId: state.profileId,
        userEquipment: state.userEquipment,
        unlockedExercises: state.unlockedExercises,
        workouts: state.workouts,
        schedule: state.schedule,
      }),
    }
  )
);
