import { updateProfilePicService } from "@/services/userService";
import { create } from "zustand";
import { useAuth } from "./authStore";

const initialState = {
  isLoading: false,
};

export const useUser = create((set) => ({
  ...initialState,

  updateProfilePic: async (userId: string, data: FormData) => {
    set({ isLoading: true });
    try {
      const res = await updateProfilePicService(userId, data);

      if (res.success) {
        useAuth.getState().setUser({
          ...useAuth.getState().user,
          profilePicUrl: res.data?.profilePicUrl || null,
        });
      }

      set({ isLoading: false });
      return res;
    } catch (error) {
      set({ isLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },
}));
