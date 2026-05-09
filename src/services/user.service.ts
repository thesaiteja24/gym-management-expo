import {
  USER_NUDGE_ENDPOINT as user_nudge_endpoint,
  USER_TOP_LIFTS_ENDPOINT as user_top_lifts_endpoint,
  USER_WORKOUT_ACTIVITY_ENDPOINT as user_workout_activity_endpoint,
} from '@/constants/urls'
import { TopLift, WorkoutActivity } from '@/types/me'
import { handleApiResponse } from '@/utils/handleApiResponse'
import client from './api'

export async function nudgeUserService(id: string, note?: string): Promise<void> {
  try {
    const res = await client.post(user_nudge_endpoint(id), { note })
    const handled = handleApiResponse<void>(res)
    if (!handled.success) throw new Error(handled.message || 'Request failed')
    return
  } catch (error: any) {
    const errData = error.response?.data
    throw new Error(errData?.message || error.message || 'Network error')
  }
}

export async function getUserWorkoutActivityService(
  userId: string,
  days: number = 30,
): Promise<WorkoutActivity> {
  try {
    const res = await client.get(user_workout_activity_endpoint(userId, days))
    const handled = handleApiResponse<WorkoutActivity>(res)
    if (!handled.success) throw new Error(handled.message || 'Request failed')
    return handled.data!
  } catch (error: any) {
    const errData = error.response?.data
    throw new Error(errData?.message || error.message || 'Network error')
  }
}

export async function getUserTopLiftsService(
  userId: string,
  limit: number = 5,
): Promise<TopLift[]> {
  try {
    const res = await client.get(user_top_lifts_endpoint(userId, limit))
    const handled = handleApiResponse<TopLift[]>(res)
    if (!handled.success) throw new Error(handled.message || 'Request failed')
    return handled.data!
  } catch (error: any) {
    const errData = error.response?.data
    throw new Error(errData?.message || error.message || 'Network error')
  }
}
