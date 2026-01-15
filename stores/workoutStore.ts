import {
  createWorkoutService,
  getAllWokroutsService,
} from "@/services/workoutServices";
import {
  finalizeSetTimer,
  isValidCompletedSet,
  serializeWorkoutForApi,
} from "@/utils/workout";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { ExerciseType, useExercise } from "./exerciseStore";

/* ───────────────── Types ───────────────── */

export type SetType = "warmup" | "working" | "dropSet" | "failureSet";

export type ExerciseGroupType = "superSet" | "giantSet";

export type WorkoutLog = {
  title: string;
  startTime: Date;
  endTime: Date;
  exercises: WorkoutLogExercise[];
  exerciseGroups: WorkoutLogGroup[];
};

export type WorkoutLogExercise = {
  exerciseId: string;
  exerciseIndex: number;
  groupId?: string | null;
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
  setType: SetType;

  // runtime-only
  completed: boolean;
  durationStartedAt?: number | null;
};

export type WorkoutLogGroup = {
  id: string;
  groupType: ExerciseGroupType;
  groupIndex: number;
  restSeconds?: number | null;
};

export type WorkoutPruneReport = {
  droppedSets: number;
  droppedExercises: number;
  droppedGroups: number;
};

export type WorkoutHistoryGroup = {
  id: string;
  groupType: ExerciseGroupType;
  groupIndex: number;
  restSeconds: number | null;
};

export type WorkoutHistoryExercise = {
  id: string;
  exerciseId: string;
  exerciseIndex: number;
  exerciseGroupId: string | null;

  exercise: {
    id: string;
    title: string;
    thumbnailUrl: string;
    exerciseType: ExerciseType;
  };

  sets: WorkoutHistorySet[];
};

export type WorkoutHistorySet = {
  id: string;
  setIndex: number;
  setType: SetType;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  note: string | null;
};

export type WorkoutHistoryItem = {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;

  exerciseGroups: WorkoutHistoryGroup[];
  exercises: WorkoutHistoryExercise[];
};

/* ───────────────── State ───────────────── */

type WorkoutState = {
  workoutLoading: boolean;
  workoutSaving: boolean;
  workoutHistory: WorkoutHistoryItem[];
  workout: WorkoutLog | null;

  rest: {
    seconds: number | null;
    startedAt: number | null;
    running: boolean;
  };

  /* Workout */
  getAllWorkouts: () => Promise<void>;
  startWorkout: () => void;
  updateWorkout: (patch: Partial<WorkoutLog>) => void;
  prepareWorkoutForSave: () => {
    workout: WorkoutLog;
    pruneReport: WorkoutPruneReport;
  } | null;
  saveWorkout: (
    prepared: WorkoutLog,
  ) => Promise<{ success: boolean; error?: any }>;
  resetWorkout: () => void;
  discardWorkout: () => void;

  /* Exercises */
  addExercise: (exerciseId: string) => void;
  removeExercise: (exerciseId: string) => void;
  replaceExercise: (oldId: string, newId: string) => void;
  reorderExercises: (ordered: WorkoutLogExercise[]) => void;
  createExerciseGroup: (type: ExerciseGroupType, exerciseIds: string[]) => void;
  removeExerciseFromGroup: (exerciseId: string) => void;

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

  resetState: () => void;
};

const initialState = {
  workoutLoading: false,
  workoutSaving: false,
  workout: null,
  workoutHistory: [],

  rest: {
    seconds: null,
    startedAt: null,
    running: false,
  },
};

/* ───────────────── Store ───────────────── */

export const useWorkout = create<WorkoutState>((set, get) => ({
  ...initialState,

  /* ───── Workout ───── */
  getAllWorkouts: async () => {
    set({ workoutLoading: true });
    try {
      const res = await getAllWokroutsService();

      if (res.success) {
        set({ workoutHistory: res.data || [] });
      }
      set({ workoutLoading: false });
    } catch (error) {
      set({ workoutLoading: false });
    }
  },

  startWorkout: () => {
    if (get().workout) return;

    set({
      workout: {
        title: "New Workout",
        startTime: new Date(),
        endTime: new Date(),
        exercises: [],
        exerciseGroups: [],
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

  updateWorkout: (patch) =>
    set((state) => {
      if (!state.workout) return state;

      return {
        workout: {
          ...state.workout,
          ...patch,
        },
      };
    }),

  prepareWorkoutForSave: () => {
    const state = get();
    const workout = state.workout;
    if (!workout) return null;

    const exerciseList = useExercise.getState().exerciseList;
    const exerciseMap = new Map(
      exerciseList.map((e) => [e.id, e.exerciseType]),
    );

    let droppedSets = 0;
    let droppedExercises = 0;
    let droppedGroups = 0;

    const finalizedExercises: WorkoutLogExercise[] = [];

    for (const ex of workout.exercises) {
      const type = exerciseMap.get(ex.exerciseId);
      if (!type) continue;

      const finalizedSets = ex.sets.map(finalizeSetTimer);
      const validSets = finalizedSets.filter((set) =>
        isValidCompletedSet(set, type),
      );

      droppedSets += finalizedSets.length - validSets.length;

      if (validSets.length === 0) {
        droppedExercises += 1;
        continue;
      }

      finalizedExercises.push({ ...ex, sets: validSets });
    }

    const finalizedWorkout: WorkoutLog = {
      ...workout,
      endTime: workout.endTime ?? new Date(),
      exercises: finalizedExercises,
    };

    // group pruning (unchanged)
    const groupCounts = new Map<string, number>();
    for (const ex of finalizedWorkout.exercises) {
      if (ex.groupId) {
        groupCounts.set(ex.groupId, (groupCounts.get(ex.groupId) ?? 0) + 1);
      }
    }

    const validGroupIds = new Set(
      [...groupCounts.entries()].filter(([, c]) => c >= 2).map(([id]) => id),
    );

    droppedGroups =
      finalizedWorkout.exerciseGroups.length -
      finalizedWorkout.exerciseGroups.filter((g) => validGroupIds.has(g.id))
        .length;

    finalizedWorkout.exerciseGroups = finalizedWorkout.exerciseGroups.filter(
      (g) => validGroupIds.has(g.id),
    );

    finalizedWorkout.exercises = finalizedWorkout.exercises.map((ex) =>
      ex.groupId && !validGroupIds.has(ex.groupId)
        ? { ...ex, groupId: null }
        : ex,
    );

    return {
      workout: finalizedWorkout,
      pruneReport: {
        droppedSets,
        droppedExercises,
        droppedGroups,
      },
    };
  },

  saveWorkout: async (prepared: WorkoutLog) => {
    set({ workoutSaving: true });

    const payload = serializeWorkoutForApi(prepared);

    try {
      // @ts-ignore
      await createWorkoutService(payload);
      set({ workoutSaving: false });
      return { success: true };
    } catch (error) {
      set({ workoutSaving: false });
      return { success: false, error };
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
              groupId: null,
              sets: [],
            },
          ],
        },
      };
    }),

  removeExercise: (exerciseId) =>
    set((state) => {
      if (!state.workout) return state;

      const workout = state.workout;
      const target = workout.exercises.find((e) => e.exerciseId === exerciseId);

      if (!target) return state;

      let exercises = workout.exercises.filter(
        (e) => e.exerciseId !== exerciseId,
      );

      let exerciseGroups = workout.exerciseGroups;

      // Handle grouping invariant
      if (target.groupId) {
        const groupId = target.groupId;
        const remaining = exercises.filter((e) => e.groupId === groupId);

        if (remaining.length < 2) {
          // Kill the group
          exerciseGroups = exerciseGroups
            .filter((g) => g.id !== groupId)
            .map((g, index) => ({ ...g, groupIndex: index }));

          // Clean leftover exercise
          exercises = exercises.map((e) =>
            e.groupId === groupId ? { ...e, groupId: null } : e,
          );
        }
      }

      // Reindex exercises
      exercises = exercises.map((e, index) => ({
        ...e,
        exerciseIndex: index,
      }));

      return {
        workout: {
          ...workout,
          exercises,
          exerciseGroups,
        },
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

  createExerciseGroup: (type, exerciseIds) =>
    set((state) => {
      if (!state.workout) return state;

      const groupId = Crypto.randomUUID();

      return {
        workout: {
          ...state.workout,
          exerciseGroups: [
            ...state.workout.exerciseGroups,
            {
              id: groupId,
              groupType: type,
              groupIndex: state.workout.exerciseGroups.length,
              restSeconds: null,
            },
          ],
          exercises: state.workout.exercises.map((ex) =>
            exerciseIds.includes(ex.exerciseId) ? { ...ex, groupId } : ex,
          ),
        },
      };
    }),

  removeExerciseFromGroup: (exerciseId) =>
    set((state) => {
      if (!state.workout) return state;

      const workout = state.workout;

      // Find the exercise
      const targetExercise = workout.exercises.find(
        (e) => e.exerciseId === exerciseId,
      );

      if (!targetExercise?.groupId) return state;

      const groupId = targetExercise.groupId;

      // Remove exercise from the group
      const updatedExercises = workout.exercises.map((ex) =>
        ex.exerciseId === exerciseId ? { ...ex, groupId: null } : ex,
      );

      // Count remaining exercises in this group
      const remainingInGroup = updatedExercises.filter(
        (ex) => ex.groupId === groupId,
      );

      // If group still valid (>= 2), keep it
      if (remainingInGroup.length >= 2) {
        return {
          workout: {
            ...workout,
            exercises: updatedExercises,
          },
        };
      }

      // Otherwise, remove the group entirely
      const updatedGroups = workout.exerciseGroups
        .filter((g) => g.id !== groupId)
        .map((g, index) => ({
          ...g,
          groupIndex: index,
        }));

      // Clear groupId for any leftover exercise
      const cleanedExercises = updatedExercises.map((ex) =>
        ex.groupId === groupId ? { ...ex, groupId: null } : ex,
      );

      return {
        workout: {
          ...workout,
          exerciseGroups: updatedGroups,
          exercises: cleanedExercises,
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
                      setType: "working",
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

  resetState: () => set({ ...initialState }),
}));
