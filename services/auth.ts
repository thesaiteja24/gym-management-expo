import { SEND_OTP_URL as send_otp_url } from "@/constants/urls";
import { handleApiResponse } from "@/utils/handleApiResponse";
import client from "./api";

type SendOtpPayload = {
  countryCode: string;
  phone: string;
  resend: boolean;
};

export async function sendOtp(payload: SendOtpPayload) {
  try {
    const res = await client.post(send_otp_url, payload);
    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    if (errData) return Promise.reject(errData);

    return Promise.reject({
      succss: false,
      message: error.message || "Network error",
    });
  }
}

