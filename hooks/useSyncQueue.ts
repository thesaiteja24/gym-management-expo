import {
  dequeue,
  getFailedQueueForUser,
  getQueueForUser,
  incrementRetry,
  moveToFailedQueue,
  QueuedMutation,
} from "@/lib/offlineQueue";
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
 * Hook to process the offline mutation queue when network is restored
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
    const queue = getQueueForUser(user.userId);
    const failed = getFailedQueueForUser(user.userId);
    useSyncStore.getState().setQueueCounts(queue.length, failed.length);
  }, [user?.userId]);

  // Initial count load
  useEffect(() => {
    updateCounts();
  }, [updateCounts]);

  const processMutation = useCallback(
    async (mutation: QueuedMutation): Promise<boolean> => {
      try {
        switch (mutation.type) {
          case "CREATE_WORKOUT":
            await createWorkoutService(mutation.payload);
            break;
          case "EDIT_WORKOUT":
            await updateWorkoutService(mutation.payload.id, mutation.payload);
            break;
          case "DELETE_WORKOUT": // Assuming we might add this
            await deleteWorkoutService(mutation.payload.id);
            break;
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
            console.warn(`Unknown mutation type: ${mutation.type}`);
            return false;
        }
        return true;
      } catch (error: any) {
        const status = error?.response?.status;

        console.error("[SYNC ERROR]", {
          id: mutation.id,
          type: mutation.type,
          status,
          message: error?.message,
        });

        // Non-retryable → move to failed queue (prevent data loss)
        if (status && status >= 400 && status < 500) {
          console.warn(
            "[SYNC] Moving non-retryable mutation to failed queue",
            mutation.id,
          );
          moveToFailedQueue(mutation.id);
          return true; // Return true to signal handled (removed from main queue)
        }

        return false;
      }
    },
    [],
  );

  const syncQueue = useCallback(async () => {
    if (!user?.userId || isSyncing.current) return;

    isSyncing.current = true;
    useSyncStore.getState().setSyncStatus(true);
    updateCounts();

    const queue = getQueueForUser(user.userId);

    for (const mutation of queue) {
      if (mutation.retryCount >= MAX_RETRIES) {
        console.warn("[SYNC] Moving dead mutation to failed queue", mutation);
        moveToFailedQueue(mutation.id);
        updateCounts();
        continue;
      }

      const success = await processMutation(mutation);

      if (success) {
        dequeue(mutation.id);
        updateCounts();
      } else {
        incrementRetry(mutation.id);
        // Wait before next attempt
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    isSyncing.current = false;
    useSyncStore.getState().setSyncStatus(false);
    updateCounts();
  }, [user?.userId, processMutation, updateCounts]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && user?.userId) {
      syncQueue();
    }
  }, [isOnline, user?.userId, syncQueue]);

  return { syncQueue, isOnline };
}
