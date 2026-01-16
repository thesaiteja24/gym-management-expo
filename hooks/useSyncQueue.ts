import {
  dequeue,
  getQueueForUser,
  incrementRetry,
  QueuedMutation,
} from "@/lib/offlineQueue";
import { createWorkoutService } from "@/services/workoutServices";
import { useAuth } from "@/stores/authStore";
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

  const processMutation = useCallback(
    async (mutation: QueuedMutation): Promise<boolean> => {
      try {
        switch (mutation.type) {
          case "CREATE_WORKOUT":
            await createWorkoutService(mutation.payload);
            break;
          // Add more mutation types here as needed
          default:
            console.warn(`Unknown mutation type: ${mutation.type}`);
            return false;
        }
        return true;
      } catch (error) {
        console.error(`Failed to sync mutation ${mutation.id}:`, error);
        return false;
      }
    },
    [],
  );

  const syncQueue = useCallback(async () => {
    if (!user?.userId || isSyncing.current) return;

    isSyncing.current = true;

    const queue = getQueueForUser(user.userId);

    for (const mutation of queue) {
      if (mutation.retryCount >= MAX_RETRIES) {
        console.warn(`Mutation ${mutation.id} exceeded max retries, skipping`);
        continue;
      }

      const success = await processMutation(mutation);

      if (success) {
        dequeue(mutation.id);
      } else {
        incrementRetry(mutation.id);
        // Wait before next attempt
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    isSyncing.current = false;
  }, [user?.userId, processMutation]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && user?.userId) {
      syncQueue();
    }
  }, [isOnline, user?.userId, syncQueue]);

  return { syncQueue, isOnline };
}
