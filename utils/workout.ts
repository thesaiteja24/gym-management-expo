import { ExerciseType } from "@/stores/exerciseStore";
import {
  WorkoutHistoryItem,
  WorkoutLog,
  WorkoutLogSet,
} from "@/stores/workoutStore";

/* ───────────────── Helpers ───────────────── */

function isWorkoutLog(
  workout: WorkoutHistoryItem | WorkoutLog,
): workout is WorkoutLog {
  return workout.startTime instanceof Date;
}

/* ───────────────── Volume ───────────────── */

export function calculateWorkoutVolume(
  workout: WorkoutHistoryItem | WorkoutLog,
) {
  let volume = 0;
  let sets = 0;

  const isLog = isWorkoutLog(workout);

  workout.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      // live workout → only completed sets
      if (isLog && "completed" in set && !set.completed) return;

      const weight =
        typeof set.weight === "string" ? Number(set.weight) : set.weight;

      if (weight != null && weight > 0 && set.reps != null && set.reps > 0) {
        volume += weight * set.reps;
        sets += 1;
      }
    });
  });

  return { volume, sets };
}

/* ───────────────── Timers ───────────────── */

export function finalizeSetTimer(set: WorkoutLogSet): WorkoutLogSet {
  if (!set.durationStartedAt) return set;

  const elapsed = Math.floor((Date.now() - set.durationStartedAt) / 1000);

  return {
    ...set,
    durationSeconds: (set.durationSeconds ?? 0) + elapsed,
    durationStartedAt: null,
  };
}

/* ───────────────── Serialization ───────────────── */

export function serializeWorkoutForApi(workout: WorkoutLog) {
  return {
    title: workout.title ?? null,
    startTime: workout.startTime?.toISOString() ?? null,
    endTime: workout.endTime?.toISOString() ?? null,

    exercises: workout.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseIndex: exercise.exerciseIndex,
      sets: exercise.sets.map((set) => ({
        setIndex: set.setIndex,
        weight: set.weight ?? null,
        reps: set.reps ?? null,
        rpe: set.rpe ?? null,
        durationSeconds: set.durationSeconds ?? null,
        restSeconds: set.restSeconds ?? null,
        note: set.note ?? null,
      })),
    })),
  };
}

/* ───────────────── Validation ───────────────── */

export function isValidCompletedSet(
  set: WorkoutLogSet,
  exerciseType: ExerciseType,
): boolean {
  if (!set.completed) return false;

  const reps = set.reps ?? 0;
  const weight = set.weight ?? 0;
  const duration = set.durationSeconds ?? 0;

  switch (exerciseType) {
    case "repsOnly":
      return reps > 0;

    case "durationOnly":
      return duration > 0;

    case "weighted":
    case "assisted":
      return reps > 0 && weight > 0;

    default:
      return false;
  }
}
