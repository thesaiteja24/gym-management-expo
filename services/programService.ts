import { useAuth } from '@/stores/authStore'
import { Program } from '@/stores/programStore'
import { ApiError, ApiResponse, handleApiResponse } from '@/utils/handleApiResponse'
import { AxiosError } from 'axios'
import client from './api'

export const createProgramService = async (data: Program): Promise<ApiResponse> => {
	const userId = useAuth.getState().user?.userId
	if (!userId) return { success: false, error: 'User not authenticated' } as any

	try {
		const response = await client.post(`/programs/${userId}`, data)
		return handleApiResponse(response)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export const getAllProgramsService = async (): Promise<ApiResponse> => {
	const userId = useAuth.getState().user?.userId
	if (!userId) {
		throw new ApiError('User not authenticated', 401)
	}

	try {
		const response = await client.get(`/programs/${userId}`)
		return handleApiResponse(response)
	} catch (error: unknown) {
		if (error instanceof AxiosError) {
			const message = error.response?.data?.message || error.message || 'Network error'

			throw new ApiError(message, error.response?.status, error.response?.data)
		}

		throw new ApiError('Unexpected error occurred')
	}
}

export const getProgramByIdService = async (programId: string): Promise<ApiResponse> => {
	const userId = useAuth.getState().user?.userId
	if (!userId) return { success: false, error: 'User not authenticated' } as any

	try {
		const response = await client.get(`/programs/${userId}/${programId}`)
		return handleApiResponse(response)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export const updateProgramService = async (programId: string, data: Program): Promise<ApiResponse> => {
	const userId = useAuth.getState().user?.userId
	if (!userId) return { success: false, error: 'User not authenticated' } as any

	try {
		const response = await client.put(`/programs/${userId}/${programId}`, data)
		return handleApiResponse(response)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export const deleteProgramService = async (programId: string): Promise<ApiResponse<void>> => {
	const userId = useAuth.getState().user?.userId
	if (!userId) return { success: false, error: 'User not authenticated' } as any

	try {
		const response = await client.delete(`/programs/${userId}/${programId}`)
		return handleApiResponse<void>(response)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}
