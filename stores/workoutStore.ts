import { create } from "zustand";
import { createActiveWorkoutSlice } from "./workout/activeWorkoutSlice";
import { createHistorySlice } from "./workout/historySlice";
import { createRestTimerSlice } from "./workout/restTimerSlice";
import { WorkoutState } from "./workout/types";

export * from "./workout/types";

const initialState = {
  workoutLoading: false,
  workoutSaving: false,
  workout: null,
  workoutHistory: [],

  rest: {
    seconds: null,
    startedAt: null,
    running: false,
  },
};

export const useWorkout = create<WorkoutState>()((...a) => ({
  ...createHistorySlice(...a),
  ...createActiveWorkoutSlice(...a),
  ...createRestTimerSlice(...a),

  resetState: () => {
    const [set] = a;
    set(initialState);
  },
}));
