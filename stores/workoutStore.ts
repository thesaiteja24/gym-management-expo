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
  sets: Array<WorkoutLogSets>;
};

type WorkoutLogSets = {
  setIndex: number;
  weight?: number;
  reps: number;
  rpe: number;
  durationSeconds?: number;
  notes?: string;
};

type WorkoutState = {
  workoutLoading: boolean;
  workoutList?: Array<Workout>;
  activeWorkout: Workout | null;
  exerciseSelection: boolean;

  // actions can be added here as needed
  startWorkout: () => void;
  endWorkout: () => void;
  setExerciseSelection: (select: boolean) => void;
  toggleExerciseInActiveWorkout: (exerciseId: string) => void;
};

const initialState = {
  workoutLoading: false,
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
}));
