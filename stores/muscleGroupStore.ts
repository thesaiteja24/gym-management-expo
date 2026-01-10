import {
  createMuscleGroupService,
  deleteMuscleGroupService,
  getAllMuscleGroupsService,
  getMuscleGroupByIdService,
  updateMuscleGroupService,
} from "@/services/muscleGroupService";
import { create } from "zustand";

type MuscleGroup = {
  id: string;
  thumbnailUrl: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type MuscleGroupState = {
  muscleGroupLoading: boolean;
  muscleGroupList: Array<MuscleGroup>;

  getAllMuscleGroups: () => Promise<void>;
  getMuscleGroupById: (id: string) => Promise<any>;
  createMuscleGroup: (data: FormData) => Promise<any>;
  updateMuscleGroup: (id: string, data: FormData) => Promise<any>;
  deleteMuscleGroup: (id: string) => Promise<any>;
  resetState: () => void;
};

const initialState = {
  muscleGroupLoading: false,
  muscleGroupList: [],
};

export const useMuscleGroup = create<MuscleGroupState>((set) => ({
  ...initialState,

  getAllMuscleGroups: async () => {
    set({ muscleGroupLoading: true });
    try {
      const res = await getAllMuscleGroupsService();

      if (res.success) {
        set({ muscleGroupList: res.data || [] });
      }
      set({ muscleGroupLoading: false });
    } catch (error) {
      set({ muscleGroupLoading: false });
    }
  },

  getMuscleGroupById: async (id: string) => {
    set({ muscleGroupLoading: true });
    try {
      const res = await getMuscleGroupByIdService(id);

      set({ muscleGroupLoading: false });
      return res;
    } catch (error) {
      set({ muscleGroupLoading: false });

      return {
        succss: false,
        error: error,
      };
    }
  },

  createMuscleGroup: async (data: FormData) => {
    set({ muscleGroupLoading: true });
    try {
      const res = await createMuscleGroupService(data);

      set({ muscleGroupLoading: false });
      return res;
    } catch (error) {
      set({ muscleGroupLoading: false });

      return {
        succss: false,
        error: error,
      };
    }
  },

  updateMuscleGroup: async (id: string, data: FormData) => {
    set({ muscleGroupLoading: true });
    try {
      const res = await updateMuscleGroupService(id, data);
      set({ muscleGroupLoading: false });
      return res;
    } catch (error) {
      set({ muscleGroupLoading: false });

      return {
        succss: false,
        error: error,
      };
    }
  },

  deleteMuscleGroup: async (id: string) => {
    set({ muscleGroupLoading: true });
    try {
      const res = await deleteMuscleGroupService(id);

      set({ muscleGroupLoading: false });
      return res;
    } catch (error) {
      set({ muscleGroupLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },

  resetState: () => set({ ...initialState }),
}));
