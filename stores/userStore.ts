import {
  getUserDataService,
  updateProfilePicService,
  updateUserDataService,
} from "@/services/userService";
import { create } from "zustand";
import { useAuth } from "./authStore";

type UserState = {
  isLoading: boolean;

  getUserData: (userId: string) => Promise<void>;
  updateProfilePic: (userId: string, data: FormData) => Promise<any>;
  updateUserData: (userId: string, data: Record<string, any>) => Promise<any>;
};

const initialState = {
  isLoading: false,
};

export const useUser = create<UserState>((set) => ({
  ...initialState,

  getUserData: async (userId: string) => {
    set({ isLoading: true });
    try {
      const res = await getUserDataService(userId);

      if (res.success) {
        useAuth.getState().setUser({
          ...useAuth.getState().user,
          userId: res.data?.id || "",
          firstName: res.data?.firstName || "",
          lastName: res.data?.lastName || "",
          phoneE164: res.data?.phoneE164 || "",
          profilePicUrl: res.data?.profilePicUrl || null,
          dateOfBirth: res.data?.dateOfBirth || null,
          height: res.data?.height || null,
          weight: res.data?.weight || null,
        });
      }
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

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

  updateUserData: async (userId: string, data: Record<string, any>) => {
    set({ isLoading: true });
    try {
      const res = await updateUserDataService(userId, data);
      const currentUser = useAuth.getState().user;

      if (res.success) {
        useAuth.getState().setUser({
          ...currentUser,
          firstName: res.data?.firstName ?? currentUser?.firstName,
          lastName: res.data?.lastName ?? currentUser?.lastName,
          dateOfBirth: res.data?.dateOfBirth ?? currentUser?.dateOfBirth,
          height: res.data?.height ?? currentUser?.height,
          weight: res.data?.weight ?? currentUser?.weight,
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
