import {
  EQUIPMENT_ITEM_URL as equipment_item_url,
  EQUIPMENT_URL as equipment_url,
} from "@/constants/urls";
import { handleApiResponse } from "@/utils/handleApiResponse";
import client from "./api";

export async function getAllEquipmentService() {
  try {
    const res = await client.get(equipment_url);

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function createEquipmentService(title: string, data: FormData) {
  try {
    const res = await client.post(
      equipment_url,
      { title, data },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function deleteEquipmentService(id: string) {
  try {
    const res = await client.delete(equipment_item_url(id));

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}
