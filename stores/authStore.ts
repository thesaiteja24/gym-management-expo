import { sendOtpService, verifyOtpService } from "@/services/authService";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { useEquipment } from "./equipmentStore";
import { useExercise } from "./exerciseStore";
import { useMuscleGroup } from "./muscleGroupStore";
import { LengthUnits, WeightUnits } from "./userStore";

type User = {
  userId?: string;
  countryCode?: string;
  phone?: string;
  phoneE164?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  preferredWeightUnit?: WeightUnits;
  preferredLengthUnit?: LengthUnits;
  height?: number | null;
  weight?: number | null;
  profilePicUrl?: string | null;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRestored: boolean;

  sendOtp: (payload: any) => Promise<any>;
  verifyOtp: (payload: any) => Promise<any>;
  restoreFromStorage: () => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
};

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  hasRestored: false,
};

export const useAuth = create<AuthState>((set, get) => ({
  ...initialState,

  sendOtp: async (payload: any) => {
    set({ isLoading: true });
    try {
      const response = await sendOtpService(payload);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({ isLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },

  verifyOtp: async (payload: any) => {
    set({ isLoading: true });
    try {
      const response = await verifyOtpService(payload);
      if (response.success) {
        const accessToken = response.data?.accessToken ?? null;
        const user = response.data?.user ?? null;

        // persist token + user in secure storage
        if (accessToken) {
          await SecureStore.setItemAsync("accessToken", accessToken);
        }
        if (user) {
          await SecureStore.setItemAsync("user", JSON.stringify(user));
        }

        set({
          isLoading: false,
          user,
          accessToken,
          isAuthenticated: true,
        });
        return response;
      } else {
        set({ isLoading: false });
        return response;
      }
    } catch (error: any) {
      set({ isLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },

  restoreFromStorage: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const userJson = await SecureStore.getItemAsync("user");
      const user = userJson ? JSON.parse(userJson) : null;

      if (token) {
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
        });
      } else {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      }
    } catch (e) {
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false, hasRestored: true });
    }
  },

  setUser: (partial: User) => {
    const current = get().user;

    const merged = current ? { ...current, ...partial } : partial;

    set({ user: merged });

    // persist merged user
    SecureStore.setItemAsync("user", JSON.stringify(merged)).catch(() => {});
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("user");
    } catch (e) {
      console.warn("Error clearing secure store on logout", e);
    } finally {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Reset reference data stores but PRESERVE workoutStore
      // to keep offline queue intact across logout/login cycles
      useEquipment.getState().resetState();
      useMuscleGroup.getState().resetState();
      useExercise.getState().resetState();
      // NOTE: workoutStore is NOT reset to preserve pending offline mutations
    }
  },
}));
