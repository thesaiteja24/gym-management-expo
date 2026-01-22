import { enqueueWorkoutDelete } from "@/lib/sync/queue";
import { getAllWorkoutsService } from "@/services/workoutServices";
import { StateCreator } from "zustand";
import { useAuth } from "../authStore";
import { SyncStatus, WorkoutHistoryItem, WorkoutState } from "./types";

export interface HistorySlice {
  workoutLoading: boolean;
  workoutHistory: WorkoutHistoryItem[];
  getAllWorkouts: () => Promise<void>;
  upsertWorkoutHistoryItem: (item: WorkoutHistoryItem) => void;
  updateWorkoutSyncStatus: (clientId: string, syncStatus: SyncStatus) => void;
  deleteWorkout: (clientId: string, dbId: string | null) => Promise<boolean>;
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
      const res = await getAllWorkoutsService();

      if (res.success && res.data) {
        set((state) => {
          // Keep pending items from local state (not yet synced)
          const pendingItems = state.workoutHistory.filter(
            (w) => w.syncStatus === "pending",
          );

          // Backend items with clientId and synced status
          const backendItems = res.data.map((item: any) => ({
            ...item,
            clientId: item.clientId,
            syncStatus: "synced" as SyncStatus,
          }));

          // Merge: pending first, then backend (filter duplicates by clientId)
          const pendingClientIds = new Set(pendingItems.map((p) => p.clientId));
          const mergedHistory = [
            ...pendingItems,
            ...backendItems.filter(
              (b: WorkoutHistoryItem) => !pendingClientIds.has(b.clientId),
            ),
          ];

          return { workoutHistory: mergedHistory, workoutLoading: false };
        });
      } else {
        set({ workoutLoading: false });
      }
    } catch (error) {
      set({ workoutLoading: false });
    }
  },

  /**
   * Upsert a workout history item.
   * Matches by clientId first (for offline items), then by id.
   */
  upsertWorkoutHistoryItem: (item: WorkoutHistoryItem) => {
    set((state) => {
      // Try to find by clientId first (most reliable for offline-first)
      const existingByClientId = state.workoutHistory.findIndex(
        (w) => w.clientId === item.clientId,
      );

      if (existingByClientId !== -1) {
        // Update existing item
        const updatedHistory = [...state.workoutHistory];
        updatedHistory[existingByClientId] = item;
        return { workoutHistory: updatedHistory };
      }

      // Fallback: check by id (for items from backend refresh)
      const existingById = state.workoutHistory.findIndex(
        (w) => w.id === item.id,
      );

      if (existingById !== -1) {
        const updatedHistory = [...state.workoutHistory];
        updatedHistory[existingById] = item;
        return { workoutHistory: updatedHistory };
      }

      // New item - add to beginning
      return {
        workoutHistory: [item, ...state.workoutHistory],
      };
    });
  },

  /**
   * Update sync status for a workout by clientId
   */
  updateWorkoutSyncStatus: (clientId: string, syncStatus: SyncStatus) => {
    set((state) => ({
      workoutHistory: state.workoutHistory.map((w) =>
        w.clientId === clientId ? { ...w, syncStatus } : w,
      ),
    }));
  },

  /**
   * Delete a workout with offline-first support.
   * - Always updates local state immediately
   * - Enqueues for background sync if needed
   */
  deleteWorkout: async (clientId: string, dbId: string | null) => {
    const previousHistory = get().workoutHistory;
    const userId = useAuth.getState().user?.userId;

    // Optimistic update: remove from list immediately
    set({
      workoutHistory: previousHistory.filter((w) => w.clientId !== clientId),
    });

    if (!userId) {
      return false;
    }

    // Check if we have a db-generated id (not same as clientId)
    const actualDbId = dbId && dbId !== clientId ? dbId : null;

    // If no actual dbId, it was never synced - just remove locally
    if (!actualDbId) {
      // Also clean up any pending queue items for this clientId
      enqueueWorkoutDelete(clientId, null, userId);
      return true;
    }

    // Enqueue for background sync
    enqueueWorkoutDelete(clientId, actualDbId, userId);

    return true;
  },
});
