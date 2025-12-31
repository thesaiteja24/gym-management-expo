import * as Crypto from "expo-crypto";
import { create } from "zustand";

type Workout = {
  title: string;
  startTime: Date;
  endTime: Date;
  exercises: Array<WorkoutLogExercise>;
};

type WorkoutLogExercise = {
  exerciseId: string;
  exerciseIndex: number;
  sets: WorkoutLogSet[];
};

type WorkoutLogSet = {
  id: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  durationSeconds?: number;
  notes?: string;
};

type WorkoutState = {
  activeWorkout: Workout | null;
  exerciseSelection: boolean;

  startWorkout: () => void;
  endWorkout: () => void;
  setExerciseSelection: (select: boolean) => void;
  toggleExerciseInActiveWorkout: (exerciseId: string) => void;
  addSetToExercise: (exerciseId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<WorkoutLogSet>,
  ) => void;
};

const initialState = {
  activeWorkout: null,
  exerciseSelection: false,
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
    set({ activeWorkout: null });
  },

  setExerciseSelection: (select: boolean) => {
    set({ exerciseSelection: select });
  },

  toggleExerciseInActiveWorkout: (exerciseId) => {
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

  addSetToExercise: (exerciseId: string) => {
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
                  sets: [
                    ...ex.sets,
                    {
                      id: Crypto.randomUUID(),
                      weight: 0,
                      reps: 0,
                    },
                  ],
                }
              : ex,
          ),
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
}));
