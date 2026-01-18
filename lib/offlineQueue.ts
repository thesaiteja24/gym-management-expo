import * as Crypto from "expo-crypto";
import { storage } from "./storage";

const QUEUE_KEY = "offline-mutation-queue";

export type MutationType =
  | "CREATE_WORKOUT"
  | "EDIT_WORKOUT"
  | "DELETE_WORKOUT"
  | "CREATE_TEMPLATE"
  | "EDIT_TEMPLATE"
  | "DELETE_TEMPLATE"
  | "UPDATE_PROFILE";

export interface QueuedMutation {
  id: string;
  type: MutationType;
  payload: any;
  userId: string;
  createdAt: number;
  retryCount: number;
}

/**
 * Get all queued mutations
 */
export function getQueue(): QueuedMutation[] {
  const raw = storage.getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save queue to storage
 */
function saveQueue(queue: QueuedMutation[]): void {
  storage.set(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Add a mutation to the queue
 */
export function enqueue(
  type: MutationType,
  payload: any,
  userId: string,
): QueuedMutation {
  const mutation: QueuedMutation = {
    id: Crypto.randomUUID(),
    type,
    payload,
    userId,
    createdAt: Date.now(),
    retryCount: 0,
  };

  const queue = getQueue();
  queue.push(mutation);
  saveQueue(queue);

  return mutation;
}

/**
 * Remove a mutation from the queue by ID
 */
export function dequeue(id: string): void {
  const queue = getQueue().filter((m) => m.id !== id);
  saveQueue(queue);
}

/**
 * Get the first item in the queue
 */
export function peek(): QueuedMutation | null {
  const queue = getQueue();
  return queue.length > 0 ? queue[0] : null;
}

/**
 * Get all mutations for a specific user
 */
export function getQueueForUser(userId: string): QueuedMutation[] {
  return getQueue().filter((m) => m.userId === userId);
}

/**
 * Increment retry count for a mutation
 */
export function incrementRetry(id: string): void {
  const queue = getQueue().map((m) =>
    m.id === id ? { ...m, retryCount: m.retryCount + 1 } : m,
  );
  saveQueue(queue);
}

/**
 * Clear all mutations (use carefully)
 */
export function clearQueue(): void {
  storage.remove(QUEUE_KEY);
}

/**
 * Clear mutations for a specific user
 */
export function clearQueueForUser(userId: string): void {
  const queue = getQueue().filter((m) => m.userId !== userId);
  saveQueue(queue);
}

/**
 * Get queue size
 */
export function getQueueSize(): number {
  return getQueue().length;
}

const FAILED_QUEUE_KEY = "offline-failed-queue";

/**
 * Get all failed mutations
 */
export function getFailedQueue(): QueuedMutation[] {
  const raw = storage.getString(FAILED_QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save failed queue to storage
 */
function saveFailedQueue(queue: QueuedMutation[]): void {
  storage.set(FAILED_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Move a mutation to the failed queue
 */
export function moveToFailedQueue(id: string): void {
  const queue = getQueue();
  const mutation = queue.find((m) => m.id === id);

  if (!mutation) return;

  // Remove from main queue
  const newQueue = queue.filter((m) => m.id !== id);
  saveQueue(newQueue);

  // Add to failed queue
  const failedQueue = getFailedQueue();
  failedQueue.push({
    ...mutation,
    retryCount: mutation.retryCount + 1, // Increment to show it failed
  });
  saveFailedQueue(failedQueue);
}

/**
 * Get failed mutations for a specific user
 */
export function getFailedQueueForUser(userId: string): QueuedMutation[] {
  return getFailedQueue().filter((m) => m.userId === userId);
}
