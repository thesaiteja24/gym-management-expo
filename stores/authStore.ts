import { sendOtpService, verifyOtpService } from "@/services/authService";
import { create } from "zustand";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuth = create((set) => ({
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
        set({
          isLoading: false,
          user: response.data.user,
          accessToken: response.data.accessToken,
          isAuthenticated: true,
        });
        return response;
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });

      return {
        success: false,
        error: error,
      };
    }
  },
}));
