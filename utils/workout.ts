import {
  WorkoutHistoryItem,
  WorkoutLog,
  WorkoutLogSet,
} from "@/stores/workoutStore";

export function calculateWorkoutVolume(workout: WorkoutHistoryItem) {
  let volume = 0;

  workout.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      if (set.weight && set.reps) {
        volume += Number(set.weight) * set.reps;
      }
    });
  });

  return volume;
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
