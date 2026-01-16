import {
  deleteWorkoutService,
  getAllWokroutsService,
} from "@/services/workoutServices";
import { StateCreator } from "zustand";
import { WorkoutHistoryItem, WorkoutState } from "./types";

export interface HistorySlice {
  workoutLoading: boolean;
  workoutHistory: WorkoutHistoryItem[];
  getAllWorkouts: () => Promise<void>;
  deleteWorkout: (id: string) => Promise<boolean>;
}

export const createHistorySlice: StateCreator<
  WorkoutState,
  [],
  [],
  HistorySlice
> = (set, get) => ({
  workoutLoading: false,
  workoutHistory: [],

  getAllWorkouts: async () => {
    set({ workoutLoading: true });
    try {
      const res = await getAllWokroutsService();

      if (res.success) {
        set({ workoutHistory: res.data || [] });
      }
      set({ workoutLoading: false });
    } catch (error) {
      set({ workoutLoading: false });
    }
  },

  deleteWorkout: async (id: string) => {
    // Optimistic update: remove from list immediately
    const previousHistory = get().workoutHistory;
    set({
      workoutHistory: previousHistory.filter((w) => w.id !== id),
    });

    try {
      const res = await deleteWorkoutService(id);

      if (res.success) {
        return true;
      }

      // Rollback on failure
      set({ workoutHistory: previousHistory });
      return false;
    } catch (error) {
      // Rollback on error
      set({ workoutHistory: previousHistory });
      return false;
    }
  },
});
