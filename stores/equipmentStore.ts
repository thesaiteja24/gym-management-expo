import {
  createEquipmentService,
  deleteEquipmentService,
  getAllEquipmentService,
  updateEquipmentService,
} from "@/services/equipmentService";
import { create } from "zustand";

type Equipment = {
  id: string;
  thumbnailUrl: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type EquipmentState = {
  equipmentLoading: boolean;
  equipmentList: Array<Equipment>;

  getAllEquipment: () => Promise<void>;
  createEquipment: (id: string, data: FormData) => Promise<any>;
  deleteEquipment: (id: string) => Promise<any>;
};

const initialState = {
  equipmentLoading: false,
  equipmentList: [],
};

export const useEquipment = create<EquipmentState>((set) => ({
  ...initialState,

  getAllEquipment: async () => {
    set({ equipmentLoading: true });
    try {
      const res = await getAllEquipmentService();

      if (res.success) {
        set({ equipmentList: res.data || [] });
      }
      set({ equipmentLoading: false });
    } catch (error) {
      set({ equipmentLoading: false });
    }
  },

  createEquipment: async (title: string, data: FormData) => {
    set({ equipmentLoading: true });
    try {
      const res = await createEquipmentService(title, data);

      set({ equipmentLoading: false });
      return res;
    } catch (error) {
      set({ equipmentLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },

  updateEquipment: async (id: string, title: string, data: FormData) => {
    set({ equipmentLoading: true });
    try {
      const res = await updateEquipmentService(id, title, data);

      set({ equipmentLoading: false });
      return res;
    } catch (error) {
      set({ equipmentLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },

  deleteEquipment: async (id: string) => {
    set({ equipmentLoading: true });
    try {
      const res = await deleteEquipmentService(id);

      set({ equipmentLoading: false });
      return res;
    } catch (error) {
      set({ equipmentLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },
}));
