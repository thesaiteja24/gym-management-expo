import { ExerciseType, useExercise } from "@/stores/exerciseStore";
import { useWorkout } from "@/stores/workoutStore";
import { AnalyticsMetrics, calculateAnalytics } from "@/utils/analytics";
import { useCallback, useMemo } from "react";

/* ────────────────────────────────────────────── */
/* Exercise analytics types */
/* ────────────────────────────────────────────── */

export interface ExerciseAnalytics {
  heaviestWeight: number;
  best1RM: number;
  bestSetVolume: number;
  setRecords: Record<number, number>;
}

/* Epley 1RM formula */
function calculate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

/* ────────────────────────────────────────────── */
/* Hook */
/* ────────────────────────────────────────────── */

export interface UseAnalyticsResult {
  userAnalytics: AnalyticsMetrics;
  getExerciseAnalytics: (exerciseId: string) => ExerciseAnalytics;
}

export function useAnalytics(): UseAnalyticsResult {
  const workoutHistory = useWorkout((s) => s.workoutHistory);
  const exerciseList = useExercise((s) => s.exerciseList);

  /* Build exercise type lookup (for user analytics) */
  const exerciseTypeMap = useMemo(() => {
    const map = new Map<string, ExerciseType>();
    for (const ex of exerciseList) {
      map.set(ex.id, ex.exerciseType);
    }
    return map;
  }, [exerciseList]);

  /* ───────────── User-level analytics ───────────── */

  const userAnalytics = useMemo(() => {
    return calculateAnalytics(workoutHistory, exerciseTypeMap);
  }, [workoutHistory, exerciseTypeMap]);

  /* ───────────── Exercise-level analytics ───────────── */

  const getExerciseAnalytics = useCallback(
    (exerciseId: string): ExerciseAnalytics => {
      let heaviestWeight = 0;
      let best1RM = 0;
      let bestSetVolume = 0;
      let setRecords: Record<number, number> = {};

      for (const workout of workoutHistory) {
        for (const exercise of workout.exercises) {
          if (exercise.exerciseId !== exerciseId) continue;

          for (const set of exercise.sets) {
            const weight = set.weight ?? 0;
            const reps = set.reps ?? 0;

            if (weight > heaviestWeight) {
              heaviestWeight = weight;
            }

            const estimated1RM = calculate1RM(weight, reps);
            if (estimated1RM > best1RM) {
              best1RM = estimated1RM;
            }

            const volume = weight * reps;
            if (volume > bestSetVolume) {
              bestSetVolume = volume;
            }

            setRecords[reps] = Math.max(setRecords[reps] ?? 0, weight);
          }
        }
      }

      return {
        heaviestWeight,
        best1RM: Math.round(best1RM),
        bestSetVolume,
        setRecords,
      };
    },
    [workoutHistory],
  );

  /* ───────────── Public API ───────────── */

  return {
    userAnalytics,
    getExerciseAnalytics,
  };
}
