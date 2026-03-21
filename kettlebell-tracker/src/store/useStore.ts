import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workout, ScheduleEntry, Equipment, Exercise, WorkoutExercise, ExerciseSet, WorkoutType } from '../lib/types';
import type { WorkoutSection, ExerciseType, WarmupDefaults } from '../lib/types';
import { migrateWorkout } from '../lib/migrations';
import { EXERCISES } from '../data/exercises';
import {
  syncAddWorkout,
  syncUpdateWorkout,
  syncDeleteWorkout,
  syncCompleteWorkout,
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
  completeWorkout: (id: string) => void;

  // Modified actions (now require sectionId)
  toggleSetComplete: (workoutId: string, sectionId: string, exerciseId: string, setId: string) => void;
  updateSetData: (workoutId: string, sectionId: string, exerciseId: string, setId: string, data: Partial<ExerciseSet>) => void;
  addSetToExercise: (workoutId: string, sectionId: string, exerciseId: string) => void;

  // New section actions
  addExerciseToSection: (workoutId: string, sectionId: string, exercise: Exercise) => void;
  removeExerciseFromSection: (workoutId: string, sectionId: string, exerciseId: string) => void;
  addSection: (workoutId: string, name: string) => void;
  removeSection: (workoutId: string, sectionId: string) => void;
  renameSection: (workoutId: string, sectionId: string, name: string) => void;
  reorderSections: (workoutId: string, orderedSectionIds: string[]) => void;

  // New exercise type actions
  setExerciseType: (exerciseId: string, type: ExerciseType) => void;
  updateWarmupDefaults: (exerciseId: string, defaults: WarmupDefaults) => void;

  // UI state
  sectionCollapseState: Record<string, boolean>;
  toggleSectionCollapsed: (sectionId: string) => void;

  // Schedule
  schedule: ScheduleEntry[];
  addScheduleEntry: (entry: ScheduleEntry) => void;
  updateScheduleEntry: (id: string, updates: Partial<ScheduleEntry>) => void;
  removeScheduleEntry: (id: string) => void;

  // Navigation
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

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
        workouts: data.workouts.map(migrateWorkout),
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
        const migratedWorkout = migrateWorkout(workout);
        if (migratedWorkout.sections.length === 0) {
          migratedWorkout.sections = [
            { id: `${Date.now()}-warmup`, name: 'Warmup', exercises: [] },
            { id: `${Date.now()}-main`, name: 'Main', exercises: [] },
          ];
        }
        set((state) => ({ workouts: [migratedWorkout, ...state.workouts] }));
        const { profileId } = get();
        if (profileId) syncAddWorkout(migratedWorkout, profileId);
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
      toggleSetComplete: (workoutId, sectionId, exerciseId, setId) => {
        const state = get();
        const workout = state.workouts.find(w => w.id === workoutId);
        const section = workout?.sections.find(s => s.id === sectionId);
        const exercise = section?.exercises.find(ex => ex.id === exerciseId);
        const setItem = exercise?.sets.find(s => s.id === setId);
        if (!setItem) { console.warn('[store] toggleSetComplete: sectionId not found', sectionId); return; }
        const newCompleted = !setItem.completed;

        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return {
              ...w,
              sections: w.sections.map(sec => {
                if (sec.id !== sectionId) return sec;
                return {
                  ...sec,
                  exercises: sec.exercises.map(ex => {
                    if (ex.id !== exerciseId) return ex;
                    return { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s) };
                  }),
                };
              }),
            };
          }),
        }));
        syncToggleSetComplete(setId, newCompleted);
      },
      updateSetData: (workoutId, sectionId, exerciseId, setId, data) => {
        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return {
              ...w,
              sections: w.sections.map(sec => {
                if (sec.id !== sectionId) return sec;
                return {
                  ...sec,
                  exercises: sec.exercises.map(ex => {
                    if (ex.id !== exerciseId) return ex;
                    return { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, ...data } : s) };
                  }),
                };
              }),
            };
          }),
        }));
        syncUpdateSetData(setId, data);
      },
      addExerciseToSection: (workoutId, sectionId, exercise) => {
        const workout = get().workouts.find(w => w.id === workoutId);
        const section = workout?.sections.find(s => s.id === sectionId);
        if (!section) { console.warn('[store] addExerciseToSection: sectionId not found', sectionId); return; }

        const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newWorkoutExercise: WorkoutExercise = {
          id: makeId(),
          exerciseId: exercise.id,
          exercise,
          sets: [
            { id: makeId(), reps: 10, weight: 16, completed: false },
            { id: makeId(), reps: 10, weight: 16, completed: false },
            { id: makeId(), reps: 10, weight: 16, completed: false },
          ],
          restSeconds: 60,
          order: section.exercises.length,
        };

        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return {
              ...w,
              sections: w.sections.map(sec => {
                if (sec.id !== sectionId) return sec;
                return { ...sec, exercises: [...sec.exercises, newWorkoutExercise] };
              }),
            };
          }),
        }));
        // TODO: syncAddExerciseToSection will be wired up in Task 7
      },
      removeExerciseFromSection: (workoutId, sectionId, exerciseId) => {
        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return {
              ...w,
              sections: w.sections.map(sec => {
                if (sec.id !== sectionId) return sec;
                return { ...sec, exercises: sec.exercises.filter(e => e.id !== exerciseId) };
              }),
            };
          }),
        }));
        syncRemoveExerciseFromWorkout(exerciseId);
      },
      addSetToExercise: (workoutId, sectionId, exerciseId) => {
        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return {
              ...w,
              sections: w.sections.map(sec => {
                if (sec.id !== sectionId) return sec;
                return {
                  ...sec,
                  exercises: sec.exercises.map(ex => {
                    if (ex.id !== exerciseId) return ex;
                    const lastSet = ex.sets[ex.sets.length - 1];
                    const newSet: ExerciseSet = {
                      id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      reps: lastSet?.reps || 10,
                      weight: lastSet?.weight || 16,
                      completed: false,
                    };
                    syncAddSet(exerciseId, newSet.id, newSet.reps, newSet.weight, ex.sets.length + 1);
                    return { ...ex, sets: [...ex.sets, newSet] };
                  }),
                };
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

      // Section management actions
      addSection: (workoutId, name) => {
        const newSection: WorkoutSection = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name,
          exercises: [],
        };
        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return { ...w, sections: [...w.sections, newSection] };
          }),
        }));
      },

      removeSection: (workoutId, sectionId) => {
        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return { ...w, sections: w.sections.filter(s => s.id !== sectionId) };
          }),
        }));
      },

      renameSection: (workoutId, sectionId, name) => {
        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            return {
              ...w,
              sections: w.sections.map(s => s.id === sectionId ? { ...s, name } : s),
            };
          }),
        }));
      },

      reorderSections: (workoutId, orderedSectionIds) => {
        set((state) => ({
          workouts: state.workouts.map(w => {
            if (w.id !== workoutId) return w;
            const sectionMap = Object.fromEntries(w.sections.map(s => [s.id, s]));
            const reordered = orderedSectionIds.map(id => sectionMap[id]).filter(Boolean) as WorkoutSection[];
            return { ...w, sections: reordered };
          }),
        }));
      },

      // Exercise type actions
      setExerciseType: (exerciseId, type) => {
        set((state) => ({
          exercises: state.exercises.map(e =>
            e.id === exerciseId ? { ...e, exerciseType: type } : e
          ),
        }));
      },

      updateWarmupDefaults: (exerciseId, defaults) => {
        set((state) => ({
          exercises: state.exercises.map(e =>
            e.id === exerciseId ? { ...e, warmupDefaults: defaults } : e
          ),
        }));
      },

      // UI state
      sectionCollapseState: {} as Record<string, boolean>,
      toggleSectionCollapsed: (sectionId) => {
        set((state) => ({
          sectionCollapseState: {
            ...state.sectionCollapseState,
            [sectionId]: !state.sectionCollapseState[sectionId],
          },
        }));
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

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

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
        exercises: state.exercises,
        workouts: state.workouts,
        schedule: state.schedule,
        theme: state.theme,
        sectionCollapseState: state.sectionCollapseState,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.workouts = state.workouts.map(migrateWorkout);
        }
      },
    }
  )
);
