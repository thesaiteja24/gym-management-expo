import { MUSCLE_GROUP_URL as muscle_group_url } from "@/constants/urls";
import { handleApiResponse } from "@/utils/handleApiResponse";
import client from "./api";

export async function getAllMuscleGroupsService() {
  try {
    const res = await client.get(muscle_group_url);

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}
