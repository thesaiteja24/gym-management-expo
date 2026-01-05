import {
  WorkoutHistoryItem,
  WorkoutLog,
  WorkoutLogSet,
} from "@/stores/workoutStore";

function isWorkoutLog(
  workout: WorkoutHistoryItem | WorkoutLog,
): workout is WorkoutLog {
  return workout.startTime instanceof Date;
}

export function calculateWorkoutVolume(
  workout: WorkoutHistoryItem | WorkoutLog,
) {
  let volume = 0;
  let sets = 0;

  const isLog = workout.startTime instanceof Date;

  workout.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      // Live workout → only completed sets
      if (isLog && "completed" in set && !set.completed) return;

      sets += 1;

      const weight =
        typeof set.weight === "string" ? Number(set.weight) : set.weight;

      if (weight != null && set.reps != null) {
        volume += weight * set.reps;
      }
    });
  });

  return { volume, sets };
}

export function finalizeSetTimer(set: WorkoutLogSet): WorkoutLogSet {
  if (!set.durationStartedAt) return set;

  const elapsed = Math.floor((Date.now() - set.durationStartedAt) / 1000);

  return {
    ...set,
    durationSeconds: (set.durationSeconds ?? 0) + elapsed,
    durationStartedAt: null,
  };
}

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
