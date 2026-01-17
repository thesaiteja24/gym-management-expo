import { WorkoutTemplate } from "@/stores/template/types";
import { ExerciseType } from "../exerciseStore";

/* ───────────────── Types ───────────────── */

export type SetType = "warmup" | "working" | "dropSet" | "failureSet";

export type ExerciseGroupType = "superSet" | "giantSet";

export type WorkoutLog = {
  id?: string;
  title: string;
  startTime: Date;
  endTime: Date;
  exercises: WorkoutLogExercise[];
  exerciseGroups: WorkoutLogGroup[];
  isEdited?: boolean;
  editedAt?: Date | null;
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
  rpe: number | null;
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
  isEdited: boolean;
  editedAt: string | null;

  exerciseGroups: WorkoutHistoryGroup[];
  exercises: WorkoutHistoryExercise[];
};

/* ───────────────── State Interface ───────────────── */

export interface RestState {
  seconds: number | null;
  startedAt: number | null;
  running: boolean;
}

export interface WorkoutState {
  workoutLoading: boolean;
  workoutSaving: boolean;
  workoutHistory: WorkoutHistoryItem[];
  workout: WorkoutLog | null;
  rest: RestState;

  /* Workout */
  getAllWorkouts: () => Promise<void>;
  deleteWorkout: (id: string) => Promise<boolean>;
  startWorkout: () => void;
  loadWorkoutHistory: (historyItem: WorkoutHistoryItem) => void;
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

  loadTemplate: (template: WorkoutTemplate) => void;

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
}
