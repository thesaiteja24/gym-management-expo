export const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const SEND_OTP_URL = `/auth/send-otp`;
export const VERIFY_OTP_URL = `/auth/verify-otp`;
export const REFRESH_TOKEN_URL = `/auth/refresh-token`;

export const GET_USER_DATA_URL = (id: string) => `/users/${id}`;
export const UPDATE_PROFILE_PIC_URL = (id: string) =>
  `/users/${id}/profile-picture`;
