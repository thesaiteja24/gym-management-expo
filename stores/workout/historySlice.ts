import { getAllWokroutsService } from "@/services/workoutServices";
import { StateCreator } from "zustand";
import { WorkoutHistoryItem, WorkoutState } from "./types";

export interface HistorySlice {
  workoutLoading: boolean;
  workoutHistory: WorkoutHistoryItem[];
  getAllWorkouts: () => Promise<void>;
}

export const createHistorySlice: StateCreator<
  WorkoutState,
  [],
  [],
  HistorySlice
> = (set) => ({
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
});
