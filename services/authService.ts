import {
  SEND_OTP_URL as send_otp_url,
  VERIFY_OTP_URL as verify_otp_url,
} from "@/constants/urls";
import { handleApiResponse } from "@/utils/handleApiResponse";
import client from "./api";

type SendOtpPayload = {
  countryCode: string;
  phone: string;
  resend: boolean;
};

type VerifyOtpPayload = {
  countryCode: string;
  phone: string;
  otp: string;
};

export async function sendOtpService(payload: SendOtpPayload) {
  try {
    const res = await client.post(send_otp_url, payload);
    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function verifyOtpService(payload: VerifyOtpPayload) {
  try {
    const res = await client.post(verify_otp_url, payload);
    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}
