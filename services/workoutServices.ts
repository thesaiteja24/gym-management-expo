import { WORKOUTS_ENDPONT as wokrouts_endpoint } from "@/constants/urls";
import { WorkoutLog } from "@/stores/workoutStore";
import { handleApiResponse } from "@/utils/handleApiResponse";
import client from "./api";

export async function getAllWokroutsService() {
  try {
    const res = await client.get(wokrouts_endpoint);

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function createWorkoutService(data: WorkoutLog) {
  try {
    const res = await client.post(wokrouts_endpoint, data);

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}
