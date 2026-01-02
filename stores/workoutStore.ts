import * as Crypto from "expo-crypto";
import { create } from "zustand";

export type Workout = {
  title: string;
  startTime: Date;
  endTime: Date;
  exercises: Array<WorkoutLogExercise>;
};

export type WorkoutLogExercise = {
  exerciseId: string;
  exerciseIndex: number;
  sets: WorkoutLogSet[];
};

export type WorkoutLogSet = {
  id: string;
  setIndex: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  durationSeconds?: number;
  notes?: string;
  completed: boolean;

  hasSeenSwipeHint?: boolean;
};

type WorkoutState = {
  activeWorkout: Workout | null;
  exerciseSelection: boolean;
  exerciseReplacementId: string | null;

  startWorkout: () => void;
  endWorkout: () => void;
  setExerciseSelection: (select: boolean) => void;
  setExerciseReplacementId: (oldExerciseId: string | null) => void;
  selectExercise: (exerciseId: string) => void;
  removeExercise: (exerciseId: string) => void;
  replaceExercise: (oldExerciseId: string, newExerciseId: string) => void;
  addSetToExercise: (exerciseId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<WorkoutLogSet>,
  ) => void;
  toggleSetCompletion: (exerciseId: string, setId: string) => void;
  removeSetFromExercise: (exerciseId: string, setId: string) => void;
  reorderExercises: (ordered: WorkoutLogExercise[]) => void;
};

const initialState = {
  activeWorkout: null,
  exerciseSelection: false,
  exerciseReplacementId: null,
};

export const useWorkout = create<WorkoutState>((set) => ({
  ...initialState,
  startWorkout: () => {
    if (useWorkout.getState().activeWorkout) {
      return; // A workout is already active
    }

    // Initalize a new workout
    const workout: Workout = {
      title: "New Workout",
      startTime: new Date(),
      endTime: new Date(),
      exercises: [],
    };
    set({ activeWorkout: workout });
  },

  endWorkout: () => {
    set({ ...initialState });
  },

  setExerciseSelection: (select: boolean) => {
    set({ exerciseSelection: select });
  },

  selectExercise: (exerciseId) => {
    set((state) => {
      const workout = state.activeWorkout;
      if (!workout) return state;

      const existsIndex = workout.exercises.findIndex(
        (e) => e.exerciseId === exerciseId,
      );

      // remove if exists
      if (existsIndex !== -1) {
        const updated = workout.exercises
          .filter((e) => e.exerciseId !== exerciseId)
          .map((e, index) => ({
            ...e,
            exerciseIndex: index,
          }));

        return {
          activeWorkout: {
            ...workout,
            exercises: updated,
          },
        };
      }

      // add if not exists
      return {
        activeWorkout: {
          ...workout,
          exercises: [
            ...workout.exercises,
            {
              exerciseId,
              exerciseIndex: workout.exercises.length,
              sets: [],
            },
          ],
        },
      };
    });
  },

  removeExercise: (exerciseId) => {
    set((state) => {
      const workout = state.activeWorkout;
      if (!workout) return state;

      const updated = workout.exercises
        .filter((e) => e.exerciseId !== exerciseId)
        .map((e, index) => ({
          ...e,
          exerciseIndex: index,
        }));

      return {
        activeWorkout: {
          ...workout,
          exercises: updated,
        },
      };
    });
  },

  reorderExercises: (ordered) => {
    set((state) => {
      if (!state.activeWorkout) return state;

      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: ordered.map((ex, index) => ({
            ...ex,
            exerciseIndex: index,
          })),
        },
      };
    });
  },

  setExerciseReplacementId: (oldExerciseId: string | null) => {
    set({ exerciseReplacementId: oldExerciseId });
  },

  replaceExercise: (oldExerciseId: string, newExerciseId: string) => {
    set((state) => {
      const workout = state.activeWorkout;
      if (!workout) return state;

      const updated = workout.exercises.map((e) =>
        e.exerciseId === oldExerciseId
          ? { ...e, exerciseId: newExerciseId }
          : e,
      );

      return {
        activeWorkout: {
          ...workout,
          exercises: updated,
        },
      };
    });
  },

  addSetToExercise: (exerciseId: string) => {
    set((state) => {
      const workout = state.activeWorkout;
      if (!workout) return state;

      return {
        activeWorkout: {
          ...workout,
          exercises: workout.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex;

            const isAddingSecondSet = ex.sets.length === 1;

            const updatedSets = ex.sets.map((s, index) =>
              isAddingSecondSet && index === 0
                ? { ...s, hasSeenSwipeHint: false } // 👈 arm hint
                : s,
            );

            return {
              ...ex,
              sets: [
                ...updatedSets,
                {
                  id: Crypto.randomUUID(),
                  setIndex: ex.sets.length,
                  weight: 0,
                  reps: 0,
                  completed: false,
                },
              ],
            };
          }),
        },
      };
    });
  },

  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<WorkoutLogSet>,
  ) => {
    set((state) => {
      const workout = state.activeWorkout;
      if (!workout) return state;

      return {
        activeWorkout: {
          ...workout,
          exercises: workout.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) =>
                    s.id === setId ? { ...s, ...patch } : s,
                  ),
                }
              : ex,
          ),
        },
      };
    });
  },

  toggleSetCompletion: (exerciseId: string, setId: string) => {
    set((state) => {
      const workout = state.activeWorkout;
      if (!workout) return state;

      return {
        activeWorkout: {
          ...workout,
          exercises: workout.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) =>
                    s.id === setId ? { ...s, completed: !s.completed } : s,
                  ),
                }
              : ex,
          ),
        },
      };
    });
  },

  removeSetFromExercise: (exerciseId: string, setId: string) => {
    set((state) => {
      const workout = state.activeWorkout;
      if (!workout) return state;

      return {
        activeWorkout: {
          ...workout,
          exercises: workout.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex;

            const filtered = ex.sets
              .filter((s) => s.id !== setId)
              .map((s, index) => ({
                ...s,
                setIndex: index,
              }));

            return { ...ex, sets: filtered };
          }),
        },
      };
    });
  },
}));
