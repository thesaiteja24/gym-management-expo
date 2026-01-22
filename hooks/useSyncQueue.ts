import {
  dequeue,
  getFailedQueueForUser,
  getQueueForUser,
  incrementRetry,
  moveToFailedQueue,
  QueuedMutation,
} from "@/lib/offlineQueue";
import {
  dequeueTemplate,
  dequeueWorkout,
  getTemplateQueueCounts,
  getTemplateQueueForUser,
  getWorkoutQueueCounts,
  getWorkoutQueueForUser,
  incrementTemplateRetry,
  incrementWorkoutRetry,
  moveTemplateToFailedQueue,
  moveWorkoutToFailedQueue,
  TemplateMutation,
  WorkoutMutation,
} from "@/lib/sync/queue";
import { queueEvents } from "@/lib/sync/queueEvents";
import {
  markTemplateFailed,
  markTemplateSynced,
  markWorkoutFailed,
  markWorkoutSynced,
  reconcileTemplateId,
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

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/* ─────────────────────────────────────────────
   Dev-only logger
───────────────────────────────────────────── */
const log = {
  info: (...a: any[]) => __DEV__ && console.log(...a),
  warn: (...a: any[]) => __DEV__ && console.warn(...a),
  error: (...a: any[]) => __DEV__ && console.error(...a),
};

/* ─────────────────────────────────────────────
   Sync Hook
───────────────────────────────────────────── */
export function useSyncQueue() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const user = useAuth((s) => s.user);

  const isOnline = isConnected && isInternetReachable !== false;
  const isSyncing = useRef(false);

  /* ─────────────────────────────────────────────
     Network status propagation
  ───────────────────────────────────────────── */
  useEffect(() => {
    useSyncStore.getState().setNetworkStatus(isOnline);
  }, [isOnline]);

  /* ─────────────────────────────────────────────
     Queue counts
  ───────────────────────────────────────────── */
  const updateCounts = useCallback(() => {
    if (!user?.userId) return;

    const legacyQueue = getQueueForUser(user.userId);
    const legacyFailed = getFailedQueueForUser(user.userId);

    const workoutCounts = getWorkoutQueueCounts(user.userId);
    const templateCounts = getTemplateQueueCounts(user.userId);

    useSyncStore
      .getState()
      .setQueueCounts(
        legacyQueue.length + workoutCounts.pending + templateCounts.pending,
        legacyFailed.length + workoutCounts.failed + templateCounts.failed,
      );
  }, [user?.userId]);

  useEffect(() => {
    updateCounts();
  }, [updateCounts]);

  /* ─────────────────────────────────────────────
     Workout mutation processor
  ───────────────────────────────────────────── */
  const processWorkoutMutation = useCallback(
    async (mutation: WorkoutMutation): Promise<boolean> => {
      try {
        switch (mutation.type) {
          case "CREATE": {
            const res = await createWorkoutService(mutation.payload);
            if (res.success && res.data?.workout?.id) {
              reconcileWorkoutId(mutation.clientId, res.data.workout.id);
            }
            markWorkoutSynced(mutation.clientId);
            return true;
          }

          case "UPDATE": {
            if (!mutation.payload.id) return false;
            await updateWorkoutService(mutation.payload.id, mutation.payload);
            markWorkoutSynced(mutation.clientId);
            return true;
          }

          case "DELETE": {
            if (mutation.payload.id) {
              await deleteWorkoutService(mutation.payload.id);
            }
            return true;
          }

          default:
            log.warn("[SYNC] Unknown workout mutation", mutation);
            return false;
        }
      } catch (error: any) {
        const status = error?.response?.status;

        log.error("[SYNC ERROR - Workout]", {
          queueId: mutation.queueId,
          type: mutation.type,
          status,
        });

        if (status && status >= 400 && status < 500) {
          markWorkoutFailed(mutation.clientId);
          moveWorkoutToFailedQueue(mutation.queueId);
          return true;
        }

        return false;
      }
    },
    [],
  );

  /* ─────────────────────────────────────────────
     Template mutation processor
  ───────────────────────────────────────────── */
  const processTemplateMutation = useCallback(
    async (mutation: TemplateMutation): Promise<boolean> => {
      try {
        switch (mutation.type) {
          case "CREATE": {
            const res = await createTemplateService(mutation.payload);
            if (res.success && res.data?.template?.id) {
              reconcileTemplateId(mutation.clientId, res.data.template.id);
            }
            markTemplateSynced(mutation.clientId);
            return true;
          }

          case "UPDATE": {
            if (!mutation.payload.id) return false;
            await updateTemplateService(mutation.payload.id, mutation.payload);
            markTemplateSynced(mutation.clientId);
            return true;
          }

          case "DELETE": {
            if (mutation.payload.id) {
              await deleteTemplateService(mutation.payload.id);
            }
            return true;
          }

          default:
            log.warn("[SYNC] Unknown template mutation", mutation);
            return false;
        }
      } catch (error: any) {
        const status = error?.response?.status;

        log.error("[SYNC ERROR - Template]", {
          queueId: mutation.queueId,
          type: mutation.type,
          status,
        });

        if (status && status >= 400 && status < 500) {
          markTemplateFailed(mutation.clientId);
          moveTemplateToFailedQueue(mutation.queueId);
          return true;
        }

        return false;
      }
    },
    [],
  );

  /* ─────────────────────────────────────────────
     Legacy mutation processor
  ───────────────────────────────────────────── */
  const processLegacyMutation = useCallback(
    async (mutation: QueuedMutation): Promise<boolean> => {
      try {
        log.warn("[SYNC] Legacy mutation encountered, removing", mutation.type);
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  /* ─────────────────────────────────────────────
     Main sync routine
  ───────────────────────────────────────────── */
  const syncQueue = useCallback(async () => {
    if (!isAuthenticated || !user?.userId || isSyncing.current) return;

    isSyncing.current = true;
    useSyncStore.getState().setSyncStatus(true);
    updateCounts();

    try {
      // Workouts
      for (const m of getWorkoutQueueForUser(user.userId)) {
        if (m.retryCount >= MAX_RETRIES) {
          markWorkoutFailed(m.clientId);
          moveWorkoutToFailedQueue(m.queueId);
          continue;
        }

        const ok = await processWorkoutMutation(m);
        if (ok) {
          dequeueWorkout(m.queueId);
        } else {
          incrementWorkoutRetry(m.queueId);
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }

      // Templates
      for (const m of getTemplateQueueForUser(user.userId)) {
        if (m.retryCount >= MAX_RETRIES) {
          markTemplateFailed(m.clientId);
          moveTemplateToFailedQueue(m.queueId);
          continue;
        }

        const ok = await processTemplateMutation(m);
        if (ok) {
          dequeueTemplate(m.queueId);
        } else {
          incrementTemplateRetry(m.queueId);
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }

      // Legacy
      for (const m of getQueueForUser(user.userId)) {
        if (m.retryCount >= MAX_RETRIES) {
          moveToFailedQueue(m.id);
          continue;
        }

        const ok = await processLegacyMutation(m);
        if (ok) {
          dequeue(m.id);
        } else {
          incrementRetry(m.id);
        }
      }
    } finally {
      isSyncing.current = false;
      useSyncStore.getState().setSyncStatus(false);
      updateCounts();
    }
  }, [
    isAuthenticated,
    user?.userId,
    processWorkoutMutation,
    processTemplateMutation,
    processLegacyMutation,
    updateCounts,
  ]);

  /* ─────────────────────────────────────────────
     Trigger sync on reconnect
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (isOnline && isAuthenticated && user?.userId) {
      syncQueue();
    }
  }, [isOnline, isAuthenticated, user?.userId, syncQueue]);

  /* ─────────────────────────────────────────────
     Reactive sync (debounced)
  ───────────────────────────────────────────── */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = queueEvents.subscribe(() => {
      if (!isOnline || !isAuthenticated || !user?.userId) return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(syncQueue, 100);
    });

    return () => {
      unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isOnline, isAuthenticated, user?.userId, syncQueue]);

  return { syncQueue, isOnline };
}
