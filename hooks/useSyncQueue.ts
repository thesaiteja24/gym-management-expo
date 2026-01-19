import {
  dequeue,
  getFailedQueueForUser,
  getQueueForUser,
  incrementRetry,
  moveToFailedQueue,
  QueuedMutation,
} from "@/lib/offlineQueue";
import {
  dequeueWorkout,
  getWorkoutQueueCounts,
  getWorkoutQueueForUser,
  incrementWorkoutRetry,
  moveWorkoutToFailedQueue,
  WorkoutMutation,
} from "@/lib/sync/queue";
import { queueEvents } from "@/lib/sync/queueEvents";
import {
  markWorkoutFailed,
  markWorkoutSynced,
  reconcileWorkoutId,
} from "@/lib/sync/reconciler";
import {
  createTemplateService,
  deleteTemplateService,
  updateTemplateService,
} from "@/services/templateService";
import {
  createWorkoutService,
  deleteWorkoutService,
  updateWorkoutService,
} from "@/services/workoutServices";
import { useAuth } from "@/stores/authStore";
import { useSyncStore } from "@/stores/syncStore";
import { useCallback, useEffect, useRef } from "react";
import { useNetworkStatus } from "./useNetworkStatus";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Hook to process the offline mutation queue when network is restored.
 * Handles both legacy queue and new workout-specific queue.
 */
export function useSyncQueue() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const user = useAuth((s) => s.user);
  const isOnline = isConnected && isInternetReachable !== false;

  const isSyncing = useRef(false);

  // Update global store network status
  useEffect(() => {
    useSyncStore.getState().setNetworkStatus(isOnline);
  }, [isOnline]);

  const updateCounts = useCallback(() => {
    if (!user?.userId) return;
    // Legacy queue counts
    const queue = getQueueForUser(user.userId);
    const failed = getFailedQueueForUser(user.userId);
    // New workout queue counts
    const workoutCounts = getWorkoutQueueCounts(user.userId);
    useSyncStore
      .getState()
      .setQueueCounts(
        queue.length + workoutCounts.pending,
        failed.length + workoutCounts.failed,
      );
  }, [user?.userId]);

  // Initial count load
  useEffect(() => {
    updateCounts();
  }, [updateCounts]);

  /**
   * Process a single workout mutation with ID reconciliation
   */
  const processWorkoutMutation = useCallback(
    async (mutation: WorkoutMutation): Promise<boolean> => {
      try {
        switch (mutation.type) {
          case "CREATE": {
            const res = await createWorkoutService(mutation.payload);
            if (res.success && res.data?.id) {
              // CRITICAL: Reconcile the clientId with the backend-generated ID
              reconcileWorkoutId(mutation.clientId, res.data.id);
              console.log(
                `[SYNC] Reconciled clientId=${mutation.clientId} -> id=${res.data.id}`,
              );
            } else {
              // Mark as synced even without full response (edge case)
              markWorkoutSynced(mutation.clientId);
            }
            break;
          }
          case "UPDATE": {
            if (mutation.payload.id) {
              await updateWorkoutService(mutation.payload.id, mutation.payload);
              markWorkoutSynced(mutation.clientId);
            } else {
              console.warn(
                "[SYNC] UPDATE mutation missing id, skipping",
                mutation,
              );
              return false;
            }
            break;
          }
          case "DELETE": {
            if (mutation.payload.id) {
              await deleteWorkoutService(mutation.payload.id);
            }
            // Item already removed from local state, nothing to reconcile
            break;
          }
          default:
            console.warn(`[SYNC] Unknown workout mutation type`, mutation);
            return false;
        }
        return true;
      } catch (error: any) {
        const status = error?.response?.status;

        console.error("[SYNC ERROR - Workout]", {
          queueId: mutation.queueId,
          type: mutation.type,
          clientId: mutation.clientId,
          status,
          message: error?.message,
        });

        // Non-retryable 4xx errors → move to failed queue
        if (status && status >= 400 && status < 500) {
          markWorkoutFailed(mutation.clientId);
          moveWorkoutToFailedQueue(mutation.queueId);
          return true; // Handled (removed from main queue)
        }

        return false;
      }
    },
    [],
  );

  /**
   * Process legacy (non-workout) mutations
   */
  const processLegacyMutation = useCallback(
    async (mutation: QueuedMutation): Promise<boolean> => {
      try {
        switch (mutation.type) {
          case "CREATE_WORKOUT":
          case "EDIT_WORKOUT":
          case "DELETE_WORKOUT":
            // These should use the new workout queue now
            // But handle legacy items gracefully
            console.warn(
              "[SYNC] Legacy workout mutation, migrating to new queue",
              mutation.type,
            );
            return true; // Remove from legacy queue
          case "UPDATE_PROFILE":
            // await updateProfileService(mutation.payload);
            break;
          case "CREATE_TEMPLATE":
            await createTemplateService(mutation.payload);
            break;
          case "EDIT_TEMPLATE":
            await updateTemplateService(mutation.payload.id, mutation.payload);
            break;
          case "DELETE_TEMPLATE":
            await deleteTemplateService(mutation.payload.id);
            break;
          default:
            console.warn(
              `[SYNC] Unknown legacy mutation type: ${mutation.type}`,
            );
            return false;
        }
        return true;
      } catch (error: any) {
        const status = error?.response?.status;

        console.error("[SYNC ERROR - Legacy]", {
          id: mutation.id,
          type: mutation.type,
          status,
          message: error?.message,
        });

        // Non-retryable → move to failed queue
        if (status && status >= 400 && status < 500) {
          moveToFailedQueue(mutation.id);
          return true;
        }

        return false;
      }
    },
    [],
  );

  /**
   * Main sync function - processes both workout and legacy queues
   */
  const syncQueue = useCallback(async () => {
    if (!user?.userId || isSyncing.current) return;

    isSyncing.current = true;
    useSyncStore.getState().setSyncStatus(true);
    updateCounts();

    // --- Process NEW workout queue first ---
    const workoutQueue = getWorkoutQueueForUser(user.userId);

    for (const mutation of workoutQueue) {
      if (mutation.retryCount >= MAX_RETRIES) {
        console.warn(
          "[SYNC] Moving dead workout mutation to failed queue",
          mutation,
        );
        markWorkoutFailed(mutation.clientId);
        moveWorkoutToFailedQueue(mutation.queueId);
        updateCounts();
        continue;
      }

      const success = await processWorkoutMutation(mutation);

      if (success) {
        dequeueWorkout(mutation.queueId);
        updateCounts();
      } else {
        incrementWorkoutRetry(mutation.queueId);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    // --- Process legacy queue (templates, profile, etc.) ---
    const legacyQueue = getQueueForUser(user.userId);

    for (const mutation of legacyQueue) {
      if (mutation.retryCount >= MAX_RETRIES) {
        console.warn(
          "[SYNC] Moving dead legacy mutation to failed queue",
          mutation,
        );
        moveToFailedQueue(mutation.id);
        updateCounts();
        continue;
      }

      const success = await processLegacyMutation(mutation);

      if (success) {
        dequeue(mutation.id);
        updateCounts();
      } else {
        incrementRetry(mutation.id);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    isSyncing.current = false;
    useSyncStore.getState().setSyncStatus(false);
    updateCounts();
  }, [
    user?.userId,
    processWorkoutMutation,
    processLegacyMutation,
    updateCounts,
  ]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && user?.userId) {
      syncQueue();
    }
  }, [isOnline, user?.userId, syncQueue]);

  // Debounce ref for queue events
  const debouncedSync = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to queue events for reactive auto-sync (debounced)
  useEffect(() => {
    const unsubscribe = queueEvents.subscribe(() => {
      if (isOnline && user?.userId) {
        // Debounce: wait 100ms before triggering sync
        if (debouncedSync.current) clearTimeout(debouncedSync.current);
        debouncedSync.current = setTimeout(() => {
          syncQueue();
        }, 100);
      }
    });
    return () => {
      unsubscribe();
      if (debouncedSync.current) clearTimeout(debouncedSync.current);
    };
  }, [isOnline, user?.userId, syncQueue]);

  return { syncQueue, isOnline };
}
