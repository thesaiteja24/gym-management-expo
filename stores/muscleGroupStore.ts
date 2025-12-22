import { getAllMuscleGroupsService } from "@/services/muscleGroupService";
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
}));
