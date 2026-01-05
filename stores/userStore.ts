import {
  getUserDataService,
  updateProfilePicService,
  updateUserDataService,
} from "@/services/userService";
import { create } from "zustand";
import { useAuth } from "./authStore";

type Preferences = {
  preferredWeightUnit?: "kg" | "lbs";
  preferredLengthUnit?: "cm" | "inches";
};

type UserState = {
  isLoading: boolean;

  getUserData: (userId: string) => Promise<void>;
  updateProfilePic: (userId: string, data: FormData) => Promise<any>;
  updateUserData: (userId: string, data: Record<string, any>) => Promise<any>;
  updatePreferences: (
    userId: string,
    data: Record<string, string>,
  ) => Promise<any>;
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
          countryCode: res.data?.countryCode || "",
          phone: res.data?.phone || "",
          firstName: res.data?.firstName || "",
          lastName: res.data?.lastName || "",
          phoneE164: res.data?.phoneE164 || "",
          profilePicUrl: res.data?.profilePicUrl || null,
          dateOfBirth: res.data?.dateOfBirth || null,
          preferredWeightUnit: res.data?.preferredWeightUnit,
          preferredLengthUnit: res.data?.preferredLengthUnit,
          height: res.data?.height || null,
          weight: res.data?.weight || null,
          role: res.data?.role,
          createdAt: res.data?.createdAt,
          updatedAt: res.data?.updatedAt,
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
      const currentUser = useAuth.getState().user;

      if (res.success) {
        useAuth.getState().setUser({
          ...currentUser,
          profilePicUrl: res.data.profilePicUrl,
          updatedAt: res.data.updatedAt,
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
          preferredWeightUnit:
            res.data?.preferredWeightUnit ?? currentUser?.preferredWeightUnit,
          preferredLengthUnit:
            res.data?.preferredLengthUnit ?? currentUser?.preferredLengthUnit,
          height: res.data?.height ?? currentUser?.height,
          weight: res.data?.weight ?? currentUser?.weight,
          updatedAt: res.data?.updatedAt ?? currentUser?.updatedAt,
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

  updatePreferences(userId, data: Preferences) {
    set({ isLoading: true });
    return new Promise(async (resolve) => {
      try {
        const res = await updateUserDataService(userId, data);
        const currentUser = useAuth.getState().user;

        if (res.success) {
          useAuth.getState().setUser({
            ...currentUser,
            preferredWeightUnit:
              res.data?.preferredWeightUnit ?? currentUser?.preferredWeightUnit,
            preferredLengthUnit:
              res.data?.preferredLengthUnit ?? currentUser?.preferredLengthUnit,
          });
        }
        set({ isLoading: false });
        resolve(res);
      } catch (error) {
        set({ isLoading: false });

        resolve({
          success: false,
          error: error,
        });
      }
    });
  },
}));
