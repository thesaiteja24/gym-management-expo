import {
  GET_USER_DATA_URL as get_user_data_url,
  UPDATE_PROFILE_PIC_URL as update_profile_pic_url,
} from "@/constants/urls";
import { handleApiResponse } from "@/utils/handleApiResponse";
import client from "./api";

export async function getUserDataService(userId: string) {
  try {
    const res = await client.get(get_user_data_url(userId));

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function updateProfilePicService(userId: string, data: FormData) {
  try {
    const res = await client.patch(update_profile_pic_url(userId), data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}
