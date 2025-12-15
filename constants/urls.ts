export const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// Authentication Endpoints
export const SEND_OTP_URL = `/auth/send-otp`;
export const VERIFY_OTP_URL = `/auth/verify-otp`;
export const REFRESH_TOKEN_URL = `/auth/refresh-token`;

// User Endpoints
export const GET_USER_DATA_URL = (id: string) => `/users/${id}`;
export const UPDATE_PROFILE_PIC_URL = (id: string) =>
  `/users/${id}/profile-picture`;
export const UPDATE_USER_DATA_URL = (id: string) => `/users/${id}`;

// Equipment Endpoints
export const EQUIPMENT_URL = `/equipment`;
export const EQUIPMENT_ITEM_URL = (id: string) => `/equipment/${id}`;
