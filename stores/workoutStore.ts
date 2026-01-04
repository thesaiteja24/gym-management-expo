import { createWokroutService } from "@/services/workoutServices";
import * as Crypto from "expo-crypto";
import { create } from "zustand";

/* ───────────────── Types ───────────────── */
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

/* ───────────────── Types ───────────────── */

export type WorkoutLog = {
  title: string;
  startTime: Date;
  endTime: Date;
  exercises: WorkoutLogExercise[];
};

export type WorkoutLogExercise = {
  exerciseId: string;
  exerciseIndex: number;
  sets: WorkoutLogSet[];
};

export type WorkoutLogSet = {
  id: string;
  setIndex: number;

  weight?: number;
  reps?: number;
  rpe?: number;
  durationSeconds?: number;
  restSeconds?: number;
  note?: string;

  completed: boolean;

  // runtime-only
  durationStartedAt?: number | null;
};

/* ───────────────── State ───────────────── */

type WorkoutState = {
  workout: WorkoutLog | null;

  rest: {
    seconds: number | null;
    startedAt: number | null;
    running: boolean;
  };

  /* Workout */
  startWorkout: () => void;
  saveWorkout: () => Promise<{ success: boolean; error?: any }>;
  discardWorkout: () => void;

  /* Exercises */
  addExercise: (exerciseId: string) => void;
  removeExercise: (exerciseId: string) => void;
  replaceExercise: (oldId: string, newId: string) => void;
  reorderExercises: (ordered: WorkoutLogExercise[]) => void;

  /* Sets */
  addSet: (exerciseId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<WorkoutLogSet>,
  ) => void;
  toggleSetCompleted: (exerciseId: string, setId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;

  /* Timers */
  startSetTimer: (exerciseId: string, setId: string) => void;
  stopSetTimer: (exerciseId: string, setId: string) => void;

  /* Rest */
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  saveRestForSet: (exerciseId: string, setId: string, seconds: number) => void;
};

/* ───────────────── Helpers ───────────────── */

const finalizeSetTimer = (set: WorkoutLogSet): WorkoutLogSet => {
  if (!set.durationStartedAt) return set;

  const elapsed = Math.floor((Date.now() - set.durationStartedAt) / 1000);

  return {
    ...set,
    durationSeconds: (set.durationSeconds ?? 0) + elapsed,
    durationStartedAt: null,
  };
};

/* ───────────────── Store ───────────────── */

export const useWorkout = create<WorkoutState>((set, get) => ({
  workout: null,

  rest: {
    seconds: null,
    startedAt: null,
    running: false,
  },

  /* ───── Workout ───── */

  startWorkout: () => {
    if (get().workout) return;

    set({
      workout: {
        title: "New Workout",
        startTime: new Date(),
        endTime: new Date(),
        exercises: [],
      },
    });
  },

  discardWorkout: () => {
    set({
      workout: null,
      rest: {
        seconds: null,
        startedAt: null,
        running: false,
      },
    });
  },

  saveWorkout: async () => {
    const state = get();
    const workout = state.workout;

    if (!workout) {
      return { success: false, error: "No active workout" };
    }

    const finalizedWorkout: WorkoutLog = {
      ...workout,
      endTime: new Date(),
      exercises: workout.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map(finalizeSetTimer),
      })),
    };

    const payload = serializeWorkoutForApi(finalizedWorkout);

    try {
      const res = await createWokroutService(payload as any);

      if (res.success) {
        // cleanup only AFTER successful save
        state.discardWorkout();
      }

      return res;
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  },

  resetWorkout: () => {
    set({
      workout: null,
      rest: {
        seconds: null,
        startedAt: null,
        running: false,
      },
    });
  },

  /* ───── Exercises ───── */

  addExercise: (exerciseId) =>
    set((state) => {
      if (!state.workout) return state;

      if (state.workout.exercises.some((e) => e.exerciseId === exerciseId)) {
        return state;
      }

      return {
        workout: {
          ...state.workout,
          exercises: [
            ...state.workout.exercises,
            {
              exerciseId,
              exerciseIndex: state.workout.exercises.length,
              sets: [],
            },
          ],
        },
      };
    }),

  removeExercise: (exerciseId) =>
    set((state) => {
      if (!state.workout) return state;

      const exercises = state.workout.exercises
        .filter((e) => e.exerciseId !== exerciseId)
        .map((e, index) => ({ ...e, exerciseIndex: index }));

      return {
        workout: { ...state.workout, exercises },
      };
    }),

  replaceExercise: (oldId, newId) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          exercises: state.workout.exercises.map((e) =>
            e.exerciseId === oldId ? { ...e, exerciseId: newId } : e,
          ),
        },
      };
    }),

  reorderExercises: (ordered) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          exercises: ordered.map((e, index) => ({
            ...e,
            exerciseIndex: index,
          })),
        },
      };
    }),

  /* ───── Sets ───── */

  addSet: (exerciseId) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          exercises: state.workout.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: [
                    ...ex.sets,
                    {
                      id: Crypto.randomUUID(),
                      setIndex: ex.sets.length,
                      completed: false,
                    },
                  ],
                }
              : ex,
          ),
        },
      };
    }),

  updateSet: (exerciseId, setId, patch) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          exercises: state.workout.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) =>
                    s.id === setId ? { ...s, ...patch } : s,
                  ),
                }
              : ex,
          ),
        },
      };
    }),

  toggleSetCompleted: (exerciseId, setId) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          exercises: state.workout.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) =>
                    s.id === setId ? { ...s, completed: !s.completed } : s,
                  ),
                }
              : ex,
          ),
        },
      };
    }),

  removeSet: (exerciseId, setId) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          exercises: state.workout.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets
                    .filter((s) => s.id !== setId)
                    .map((s, index) => ({ ...s, setIndex: index })),
                }
              : ex,
          ),
        },
      };
    }),

  /* ───── Set Timers ───── */

  startSetTimer: (exerciseId, setId) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          exercises: state.workout.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) =>
                    s.id === setId && !s.durationStartedAt
                      ? { ...s, durationStartedAt: Date.now() }
                      : s,
                  ),
                }
              : ex,
          ),
        },
      };
    }),

  stopSetTimer: (exerciseId, setId) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          exercises: state.workout.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) =>
                    s.id === setId ? finalizeSetTimer(s) : s,
                  ),
                }
              : ex,
          ),
        },
      };
    }),

  /* ───── Rest ───── */

  startRestTimer: (seconds) =>
    set({
      rest: {
        seconds,
        startedAt: Date.now(),
        running: true,
      },
    }),

  stopRestTimer: () =>
    set({
      rest: {
        seconds: null,
        startedAt: null,
        running: false,
      },
    }),

  adjustRestTimer: (deltaSeconds) =>
    set((state) => {
      if (!state.rest.running || state.rest.seconds == null) return state;

      return {
        rest: {
          ...state.rest,
          seconds: Math.max(0, state.rest.seconds + deltaSeconds),
        },
      };
    }),

  saveRestForSet: (exerciseId, setId, seconds) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          exercises: state.workout.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) =>
                    s.id === setId ? { ...s, restSeconds: seconds } : s,
                  ),
                }
              : ex,
          ),
        },
      };
    }),
}));
