import {
  createExerciseService,
  deleteExerciseService,
  getAllExercisesService,
  getExerciseByIdService,
  updateExerciseService,
} from "@/services/exerciseService";
import { create } from "zustand";

export type ExerciseType =
  | "repsOnly"
  | "assisted"
  | "weighted"
  | "durationOnly";

export type MuscleGroup = {
  id: string;
  title: string;
  thumbnailUrl: string;
  tags: Array<string>;
};

export type Equipment = {
  id: string;
  title: string;
  thumbnailUrl: string;
};

export type Exercise = {
  id: string;
  title: string;
  instructions: string;
  thumbnailUrl: string;
  videoUrl: string;
  primaryMuscleGroupId: string;
  primaryMuscleGroup: MuscleGroup;
  equipmentId: string;
  equipment: Equipment;
  exerciseType: ExerciseType;
  createdAt: string;
  updatedAt: string;

  otherMuscleGroups: Array<MuscleGroup>;
};

type ExerciseState = {
  exerciseLoading: boolean;
  exerciseList: Array<Exercise>;

  getAllExercises: () => Promise<void>;
  getExerciseById: (id: string) => Promise<any>;
  createExercise: (data: FormData) => Promise<any>;
  updateExercise: (id: string, data: FormData) => Promise<any>;
  deleteExercise: (id: string) => Promise<any>;
};

const initialState = {
  exerciseLoading: false,
  exerciseList: [],
};

export const useExercise = create<ExerciseState>((set) => ({
  ...initialState,

  getAllExercises: async () => {
    set({ exerciseLoading: true });
    try {
      const res = await getAllExercisesService();

      if (res.success) {
        set({ exerciseList: res.data || [] });
      }
      set({ exerciseLoading: false });
    } catch (error) {
      set({ exerciseLoading: false });
    }
  },

  getExerciseById: async (id: string) => {
    set({ exerciseLoading: true });
    try {
      const res = await getExerciseByIdService(id);

      set({ exerciseLoading: false });
      return res;
    } catch (error) {
      set({ exerciseLoading: false });

      return {
        succss: false,
        error: error,
      };
    }
  },

  createExercise: async (data: FormData) => {
    set({ exerciseLoading: true });
    try {
      const res = await createExerciseService(data);

      set({ exerciseLoading: false });
      return res;
    } catch (error) {
      set({ exerciseLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },

  updateExercise: async (id: string, data: FormData) => {
    set({ exerciseLoading: true });
    try {
      const res = await updateExerciseService(id, data);

      set({ exerciseLoading: false });
      return res;
    } catch (error) {
      set({ exerciseLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },

  deleteExercise: async (id: string) => {
    set({ exerciseLoading: true });
    try {
      const res = await deleteExerciseService(id);

      set({ exerciseLoading: false });
      return res;
    } catch (error) {
      set({ exerciseLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },
}));
