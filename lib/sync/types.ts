/**
 * Sync Types
 *
 * Core type definitions for the offline-first sync system.
 * These types are used across the sync infrastructure.
 */

/**
 * Sync status for any syncable entity (workout, template, etc.)
 */
export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

/**
 * Base interface for any entity that can be synced
 */
export interface SyncableEntity {
  clientId: string; // Client-generated UUID, stable identifier
  id: string | null; // Backend-generated ID, null until synced
  syncStatus: SyncStatus;
}

/**
 * Mutation types for the workout domain
 */
export type WorkoutMutationType = "CREATE" | "UPDATE" | "DELETE";

/**
 * Serialized workout payload for API/queue
 */
export interface WorkoutPayload {
  clientId: string;
  id?: string | null;
  title?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  exercises?: SerializedExercise[];
  exerciseGroups?: SerializedExerciseGroup[];
}

/**
 * Serialized exercise for API payload
 */
export interface SerializedExercise {
  exerciseId: string;
  exerciseIndex: number;
  exerciseGroupId?: string | null;
  sets: SerializedSet[];
}

/**
 * Serialized set for API payload
 */
export interface SerializedSet {
  setIndex: number;
  setType: string;
  weight?: number | null;
  reps?: number | null;
  rpe?: number | null;
  durationSeconds?: number | null;
  restSeconds?: number | null;
  note?: string | null;
}

/**
 * Serialized exercise group for API payload
 */
export interface SerializedExerciseGroup {
  id: string;
  groupType: string;
  groupIndex: number;
  restSeconds?: number | null;
}

/**
 * Workout mutation stored in the queue
 */
export interface WorkoutMutation {
  queueId: string; // Unique queue item ID
  clientId: string; // Workout clientId (dedup key)
  type: WorkoutMutationType;
  payload: WorkoutPayload;
  userId: string;
  createdAt: number;
  retryCount: number;
}

/**
 * Result of a sync operation
 */
export interface SyncResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error | string;
  shouldRetry?: boolean;
}
