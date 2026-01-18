import { ExerciseGroupType, SetType } from "../workout/types";

export interface TemplateSet {
  id: string; // Frontend UUID for keys
  setIndex: number;
  setType: SetType;
  weight?: number;
  reps?: number;
  rpe?: number;
  note?: string;
  durationSeconds?: number;
  restSeconds?: number;
}

export interface TemplateExercise {
  id: string; // Frontend UUID or DB ID
  exerciseId: string;
  exerciseIndex: number;
  exerciseGroupId?: string;
  sets: TemplateSet[];

  // Hydrated details
  title?: string;
  thumbnailUrl?: string;
}

export interface TemplateExerciseGroup {
  id: string;
  groupType: ExerciseGroupType;
  groupIndex: number;
  restSeconds?: number;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  exercises: TemplateExercise[];
  exerciseGroups: TemplateExerciseGroup[];
}

export type DraftTemplate = Omit<
  WorkoutTemplate,
  "id" | "createdAt" | "updatedAt"
> & {
  // Optional ID if editing existing
  id?: string;
};

export interface TemplateState {
  templates: WorkoutTemplate[];
  templateLoading: boolean;

  // Draft state
  draftTemplate: DraftTemplate | null;

  getAllTemplates: () => Promise<void>;
  createTemplate: (data: DraftTemplate) => Promise<any>;
  updateTemplate: (id: string, data: Partial<WorkoutTemplate>) => Promise<any>;
  deleteTemplate: (id: string) => Promise<any>;
  startWorkoutFromTemplate: (templateId: string) => void;

  // Draft Actions
  startDraftTemplate: (initialData?: Partial<DraftTemplate>) => void;
  updateDraftTemplate: (patch: Partial<DraftTemplate>) => void;
  discardDraftTemplate: () => void;

  addExerciseToDraft: (exerciseId: string) => void;
  removeExerciseFromDraft: (exerciseId: string) => void;
  replaceDraftExercise: (oldId: string, newId: string) => void;
  reorderDraftExercises: (ordered: TemplateExercise[]) => void;

  addSetToDraft: (exerciseId: string) => void;
  updateDraftSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<TemplateSet>,
  ) => void;
  removeSetFromDraft: (exerciseId: string, setId: string) => void;

  createDraftExerciseGroup: (
    exerciseIds: string[],
    type: ExerciseGroupType,
  ) => void;
  removeDraftExerciseGroup: (groupId: string) => void;
}
