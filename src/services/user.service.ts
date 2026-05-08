import { USER_NUDGE_ENDPOINT as user_nudge_endpoint } from '@/constants/urls'
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
