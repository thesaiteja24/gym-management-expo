import { enqueueUserUpdate } from "@/lib/sync/queue/userQueue";
import { UserPayload } from "@/lib/sync/types";
import {
  getUserDataService,
  searchUsersService,
  updateProfilePicService,
} from "@/services/userService";
import { serializeUserUpdateForApi } from "@/utils/serializeForApi";
import { create } from "zustand";
import { useAuth } from "./authStore";

export type WeightUnits = "kg" | "lbs";
export type LengthUnits = "cm" | "inches";

type Preferences = {
  preferredWeightUnit?: WeightUnits;
  preferredLengthUnit?: LengthUnits;
};

export interface SearchedUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePicUrl: string | null;
}

type UserState = {
  isLoading: boolean;
  searchLoading: boolean;
  searchResult: SearchedUser[] | null;

  getUserData: (userId: string) => Promise<void>;
  updateProfilePic: (userId: string, data: FormData) => Promise<any>;
  updateUserData: (userId: string, data: Record<string, any>) => Promise<any>;
  updatePreferences: (
    userId: string,
    data: Record<string, string>,
  ) => Promise<any>;
  searchUsers: (query: string) => Promise<any>;
  resetSearchedUser: () => void;
};

const initialState = {
  isLoading: false,
  searchLoading: false,
  searchResult: null,
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
    // offline-first implementation
    const currentUser = useAuth.getState().user;

    // Optimistically update
    useAuth.getState().setUser({
      ...currentUser,
      ...data,
      updatedAt: new Date().toISOString(),
    });

    // Queue update
    const payload: UserPayload = {
      userId,
      ...data,
    };

    try {
      enqueueUserUpdate(
        "UPDATE_USER",
        serializeUserUpdateForApi(payload),
        userId,
      );
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  updatePreferences(userId, data: Preferences) {
    return new Promise(async (resolve) => {
      // offline-first implementation
      const currentUser = useAuth.getState().user;

      const updateData: Record<string, any> = {};
      if (data.preferredWeightUnit)
        updateData.preferredWeightUnit = data.preferredWeightUnit;
      if (data.preferredLengthUnit)
        updateData.preferredLengthUnit = data.preferredLengthUnit;

      // Optimistically update
      useAuth.getState().setUser({
        ...currentUser,
        ...updateData,
      });

      // Queue update
      const payload: UserPayload = {
        userId,
        ...updateData,
      };

      try {
        enqueueUserUpdate(
          "UPDATE_PREFERENCES",
          serializeUserUpdateForApi(payload),
          userId,
        );
        resolve({ success: true });
      } catch (error) {
        resolve({ success: false, error });
      }
    });
  },

  searchUsers(query) {
    return new Promise(async (resolve) => {
      try {
        set({ searchLoading: true });
        const res = await searchUsersService(query);
        set({ searchResult: res.data || [] });
        resolve(res);
      } catch (error) {
        resolve({ success: false, error });
      } finally {
        set({ searchLoading: false });
      }
    });
  },

  resetSearchedUser: () => {
    set({ searchResult: null });
  },
}));
