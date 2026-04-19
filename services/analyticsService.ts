import {
	FITNESS_PROFILE_ENDPOINT,
	MEASUREMENTS_ENDPOINT,
	NUTRITION_PLAN_ENDPOINT,
	TRAINING_ANALYTICS_ENDPOINT,
	USER_ANALYTICS_ENDPOINT,
} from '@/constants/urls'
import { handleApiResponse } from '@/utils/handleApiResponse'
import client from './api'

export async function getFitnessProfileService(id: string) {
	try {
		const res = await client.get(FITNESS_PROFILE_ENDPOINT(id))

		return handleApiResponse(res)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export async function getMeasurementsService(id: string, duration?: string) {
	try {
		const res = await client.get(MEASUREMENTS_ENDPOINT(id, duration))

		return handleApiResponse(res)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export async function getNutritionPlanService(id: string) {
	try {
		const res = await client.get(NUTRITION_PLAN_ENDPOINT(id))

		return handleApiResponse(res)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export async function updateFitnessProfileService(id: string, data: any) {
	try {
		const res = await client.put(FITNESS_PROFILE_ENDPOINT(id), data)

		return handleApiResponse(res)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export async function addMeasurementsService(id: string, data: any) {
	try {
		const isFormData = data instanceof FormData
		const res = await client.post(MEASUREMENTS_ENDPOINT(id), data, {
			headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
		})

		return handleApiResponse(res)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export async function updateMeasurementsService(id: string, data: any) {
	try {
		const res = await client.put(MEASUREMENTS_ENDPOINT(id), data)

		return handleApiResponse(res)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export async function updateNutritionPlanService(id: string, data: any) {
	try {
		const res = await client.put(NUTRITION_PLAN_ENDPOINT(id), data)

		return handleApiResponse(res)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export async function getUserAnalyticsService(id: string) {
	try {
		const res = await client.get(USER_ANALYTICS_ENDPOINT(id))

		return handleApiResponse(res)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}

export async function getTrainingAnalyticsService(id: string, duration: string) {
	try {
		const res = await client.get(TRAINING_ANALYTICS_ENDPOINT(id, duration))

		return handleApiResponse(res)
	} catch (error: any) {
		const errData = error.response?.data
		throw new Error(errData?.message || error.message || 'Network error')
	}
}
