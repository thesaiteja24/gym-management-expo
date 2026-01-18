import { checkNetworkStatus } from "@/hooks/useNetworkStatus";
import { enqueue } from "@/lib/offlineQueue";
import {
  createWorkoutService,
  updateWorkoutService,
} from "@/services/workoutServices";
import { WorkoutTemplate } from "@/stores/template/types";
import {
  finalizeSetTimer,
  isValidCompletedSet,
  serializeWorkoutForApi,
} from "@/utils/workout";
import * as Crypto from "expo-crypto";
import { StateCreator } from "zustand";
import { useAuth } from "../authStore";
import { ExerciseType, useExercise } from "../exerciseStore";
import {
  ExerciseGroupType,
  WorkoutHistoryItem,
  WorkoutLog,
  WorkoutLogExercise,
  WorkoutLogSet,
  WorkoutPruneReport,
  WorkoutState,
} from "./types";

export interface ActiveWorkoutSlice {
  workoutSaving: boolean;
  workout: WorkoutLog | null;

  startWorkout: () => void;
  loadWorkoutHistory: (historyItem: WorkoutHistoryItem) => void;
  loadTemplate: (template: WorkoutTemplate) => void;
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

  addExercise: (exerciseId: string) => void;
  removeExercise: (exerciseId: string) => void;
  replaceExercise: (oldId: string, newId: string) => void;
  reorderExercises: (ordered: WorkoutLogExercise[]) => void;
  createExerciseGroup: (type: ExerciseGroupType, exerciseIds: string[]) => void;
  removeExerciseFromGroup: (exerciseId: string) => void;

  addSet: (exerciseId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<WorkoutLogSet>,
  ) => void;
  toggleSetCompleted: (exerciseId: string, setId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;

  startSetTimer: (exerciseId: string, setId: string) => void;
  stopSetTimer: (exerciseId: string, setId: string) => void;
}

export const createActiveWorkoutSlice: StateCreator<
  WorkoutState,
  [],
  [],
  ActiveWorkoutSlice
> = (set, get) => ({
  workoutSaving: false,
  workout: null,

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
    const workout = get().workout;
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

    // group pruning
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

  loadWorkoutHistory: (historyItem: WorkoutHistoryItem) => {
    // Map history item to active workout state
    const workoutLog: WorkoutLog = {
      id: historyItem.id,
      title: historyItem.title || "Untitled Workout",
      startTime: new Date(historyItem.startTime),
      endTime: new Date(historyItem.endTime),
      exercises: historyItem.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseIndex: ex.exerciseIndex,
        groupId: ex.exerciseGroupId,
        sets: ex.sets.map((s) => ({
          id: s.id,
          setIndex: s.setIndex,
          setType: s.setType,
          weight: s.weight ?? undefined, // handle nulls
          reps: s.reps ?? undefined,
          rpe: undefined, // RPE not strictly typed in history item, assuming undefined or need map
          durationSeconds: s.durationSeconds ?? undefined,
          restSeconds: s.restSeconds ?? undefined,
          note: s.note ?? undefined,
          completed: true, // past workouts are completed
        })),
      })),
      exerciseGroups: historyItem.exerciseGroups.map((g) => ({
        id: g.id,
        groupType: g.groupType,
        groupIndex: g.groupIndex,
        restSeconds: g.restSeconds,
      })),
    };

    set({
      workout: workoutLog,
      // For editing mode, we might want to flag specific UI states, but user said "start.tsx" used directly
    });
  },

  loadTemplate: (template: WorkoutTemplate) => {
    // Map template to NEW active workout state
    const workoutLog: WorkoutLog = {
      // No ID initially (create new on save)
      title: template.title || "New Workout",
      startTime: new Date(),
      endTime: new Date(), // Placeholder, updates on save
      exercises: template.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseIndex: ex.exerciseIndex,
        groupId: ex.exerciseGroupId || null,
        sets: ex.sets.map((s) => ({
          id: Crypto.randomUUID(), // New UUIDs for sets
          setIndex: s.setIndex,
          setType: s.setType,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
          durationSeconds: s.durationSeconds,
          restSeconds: s.restSeconds,
          completed: false, // reset completion
        })),
      })),
      exerciseGroups: template.exerciseGroups.map((g) => ({
        id: g.id,
        groupType: g.groupType,
        groupIndex: g.groupIndex,
        restSeconds: g.restSeconds,
      })),
    };

    set({
      workout: workoutLog,
    });
  },

  saveWorkout: async (prepared: WorkoutLog) => {
    set({ workoutSaving: true });

    const payload = serializeWorkoutForApi(prepared);

    // Add clientId for idempotency
    const clientId = Crypto.randomUUID();
    const payloadWithClientId = { ...payload, clientId };

    try {
      // Check network status
      const { isConnected, isInternetReachable } = await checkNetworkStatus();
      const isOnline = isConnected && isInternetReachable !== false;

      // --- Helper to create optimistic history item ---
      const createOptimisticItem = (
        log: WorkoutLog,
        logId: string,
      ): WorkoutHistoryItem => ({
        id: logId,
        title: log.title || "Untitled Workout",
        startTime: log.startTime.toISOString(),
        endTime: log.endTime.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false,
        editedAt: null,
        exerciseGroups: log.exerciseGroups.map((g) => ({
          id: g.id,
          groupType: g.groupType,
          groupIndex: g.groupIndex,
          restSeconds: g.restSeconds ?? null,
        })),
        exercises: log.exercises.map((ex) => ({
          id: Crypto.randomUUID(), // Temp ID
          exerciseId: ex.exerciseId,
          exerciseIndex: ex.exerciseIndex,
          exerciseGroupId: ex.groupId ?? null,
          exercise: (useExercise
            .getState()
            .exerciseList.find((e) => e.id === ex.exerciseId) || {
            id: ex.exerciseId,
            title: "Unknown Exercise",
            thumbnailUrl: "",
            exerciseType: "repsOnly" as ExerciseType,
            description: "",
            muscleGroups: [],
            equipment: [],
          }) as any, // Cast to any to avoid strict structural match issues for now
          sets: ex.sets.map((s) => ({
            id: s.id,
            setIndex: s.setIndex,
            setType: s.setType,
            weight: s.weight ?? null,
            reps: s.reps ?? null,
            rpe: s.rpe ?? null,
            durationSeconds: s.durationSeconds ?? null,
            restSeconds: s.restSeconds ?? null,
            note: s.note ?? null,
          })),
        })),
      });

      if (!isOnline) {
        const userId = useAuth.getState().user?.userId;
        if (userId) {
          if (prepared.id) {
            enqueue("EDIT_WORKOUT", { id: prepared.id, ...payload }, userId);
            // Optimistic update for edit
            get().upsertWorkoutHistoryItem(
              createOptimisticItem(prepared, prepared.id),
            );
          } else {
            enqueue("CREATE_WORKOUT", payloadWithClientId, userId);
            // Optimistic update for create (using clientId as temp ID if needed, or if prepared.id is undefined)
            // But History Item needs an ID.
            // In theory, `prepared` should have an ID if it's an edit. If create, it doesn't.
            // When we sync, the backend gives a real ID.
            // If we use clientId as ID locally, we might have duplicates if we later fetch global list.
            // But we must show SOMETHING.
            // Let's use clientId as the ID for now.
            get().upsertWorkoutHistoryItem(
              createOptimisticItem(prepared, clientId),
            );
          }
        }
        set({ workoutSaving: false });
        return { success: true, queued: true };
      }

      // Online
      if (prepared.id) {
        // @ts-ignore
        await updateWorkoutService(prepared.id, payload);
        // Optimistic update for edit
        get().upsertWorkoutHistoryItem(
          createOptimisticItem(prepared, prepared.id),
        );
      } else {
        // @ts-ignore
        const res = await createWorkoutService(payloadWithClientId);
        if (res.success && res.data) {
          // Use the REAL data from backend
          get().upsertWorkoutHistoryItem(res.data);
        }
      }

      set({ workoutSaving: false });
      // We don't need to refetch all workouts anymore!
      // get().getAllWorkouts();
      return { success: true };
    } catch (error) {
      // If network error, queue it
      const userId = useAuth.getState().user?.userId;
      if (userId) {
        if (prepared.id) {
          enqueue("EDIT_WORKOUT", { id: prepared.id, ...payload }, userId);
        } else {
          enqueue("CREATE_WORKOUT", payloadWithClientId, userId);
        }
        set({ workoutSaving: false });
        return { success: true, queued: true };
      }
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
});
