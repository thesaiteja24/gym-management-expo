export const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// Authentication Endpoints
export const SEND_OTP_ENDPOINT = `/auth/send-otp`;
export const VERIFY_OTP_ENDPOINT = `/auth/verify-otp`;
export const REFRESH_TOKEN_ENDPOINT = `/auth/refresh-token`;

// User Endpoints
export const USER_ENDPOINT = (id: string) => `/users/${id}`;
export const UPDATE_PROFILE_PIC_ENDPOINT = (id: string) =>
  `/users/${id}/profile-picture`;
export const UPDATE_USER_DATA_ENDPOINT = (id: string) => `/users/${id}`;

// Equipment Endpoints
export const EQUIPMENT_ENDPOINT = `/equipment`;
export const EQUIPMENT_ITEM_ENDPOINT = (id: string) => `/equipment/${id}`;

// Muscle Group Endpoints
export const MUSCLE_GROUPS_ENDPOINT = `/muscle-groups`;
export const MUSCLE_GROUP_ITEM_ENDPOINT = (id: string) =>
  `/muscle-groups/${id}`;

// Exercise Endpoints
export const EXERCISES_ENDPOINT = `/exercises`;
export const EXERCISE_ITEM_ENDPOINT = (id: string) => `/exercises/${id}`;
