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
  activeWorkout?: Workout;

  // actions can be added here as needed
  startWorkout: () => void;
  endWorkout: () => void;
};

const initialState = {
  workoutLoading: false,
  activeWorkout: undefined,
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
    set({ activeWorkout: undefined });
  },
}));
