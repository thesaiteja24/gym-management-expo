import {
  MUSCLE_GROUP_ITEM_URL as muscle_group_item_url,
  MUSCLE_GROUP_URL as muscle_group_url,
} from "@/constants/urls";
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

export async function getMuscleGroupByIdService(id: string) {
  try {
    const res = await client.get(muscle_group_item_url(id));

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function createMuscleGroupService(data: FormData) {
  try {
    const res = await client.post(muscle_group_url, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function updateMuscleGroupService(
  id: string,
  data: FormData | null
) {
  try {
    const res = await client.put(muscle_group_item_url(id), data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function deleteMuscleGroupService(id: string) {
  try {
    const res = await client.delete(muscle_group_item_url(id));

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}
