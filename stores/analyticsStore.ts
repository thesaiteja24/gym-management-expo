import { AnalyticsMetrics, calculateAnalytics } from "@/utils/analytics";
import { useMemo } from "react";
import { ExerciseType, useExercise } from "./exerciseStore";
import { useWorkout } from "./workoutStore";

/**
 * useAnalytics Hook
 *
 * A derived store pattern that aggregates data from workoutStore and exerciseStore
 * to provide real-time analytics metrics for the UI.
 *
 * We opt for a hook-based approach here because we need to combine state from
 * multiple distinct stores (workout & exercise), and Memoization is sufficient
 * for performance as long as the inputs are stable references.
 */
export function useAnalytics(): AnalyticsMetrics {
  const workoutHistory = useWorkout((s) => s.workoutHistory);
  const exerciseList = useExercise((s) => s.exerciseList);

  // Create a quick lookup map for exercise types
  // This is Memoized to avoid rebuilding on every render unless list changes
  const exerciseTypeMap = useMemo(() => {
    const map = new Map<string, ExerciseType>();
    exerciseList.forEach((ex) => map.set(ex.id, ex.exerciseType));
    return map;
  }, [exerciseList]);

  // Compute analytics
  // This runs whenever history or exercise definitions change
  const metrics = useMemo(() => {
    return calculateAnalytics(workoutHistory, exerciseTypeMap);
  }, [workoutHistory, exerciseTypeMap]);

  return metrics;
}
