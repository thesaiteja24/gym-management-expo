import { zustandStorage } from '@/lib/storage'
import {
	createProgramService,
	getAllProgramsService,
	getProgramByIdService,
	updateProgramService,
} from '@/services/programService'
import { ApiError } from '@/utils/handleApiResponse'
import { serializeProgramForApi } from '@/utils/serializeForApi'
import * as Crypto from 'expo-crypto'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { WorkoutTemplate } from './template/types'

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'

export interface ProgramDay {
	id: string
	weekId: string
	name: string
	dayIndex: number
	isRestDay: boolean
	templateId: string | null
	template?: WorkoutTemplate | null
	key?: string // frontend stability
}

export interface ProgramWeek {
	id: string
	programId: string
	name: string
	weekIndex: number
	days: ProgramDay[]
	key?: string // frontend stability
}

export interface Program {
	id: string
	clientId: string
	title: string
	description: string
	experienceLevel: FitnessLevel
	durationOptions: number[]
	createdBy: string
	createdAt: string
	updatedAt: string
	deletedAt: string
	weeks: ProgramWeek[]
}

export interface ProgramState {
	programs: Program[]
	programLoading: boolean
	programByIdLoading: boolean
	draftProgram: Program | null

	getAllPrograms: () => Promise<void>
	getProgramById: (programId: string) => Promise<{ success: boolean; data: Program | null; error?: string }>
	startDraftProgram: (program?: Program) => void
	updateDraftProgram: (patch: Partial<Program>) => void
	discardDraftProgram: () => void
	createProgram: (data: Program) => Promise<{ success: boolean; data?: Program; error?: string }>
	updateProgram: (programId: string, data: Program) => Promise<{ success: boolean; data?: Program; error?: string }>
}

const initialState = {
	programs: [],
	programLoading: false,
	programByIdLoading: false,
	activeProgramId: null,
	draftProgram: null,
}

export const useProgram = create<ProgramState>()(
	persist(
		(set, get) => ({
			...initialState,

			getAllPrograms: async () => {
				set({ programLoading: true })

				try {
					const res = await getAllProgramsService()

					set({
						programs: res.data.programs ?? [],
					})
				} catch (error: unknown) {
					let message = 'Something went wrong'

					if (error instanceof ApiError) {
						message = error.message
					} else if (error instanceof Error) {
						message = error.message
					}

					set({ programs: [] })

					console.error(message, error)
				} finally {
					set({ programLoading: false })
				}
			},

			getProgramById: async programId => {
				set({ programByIdLoading: true })

				try {
					const res = await getProgramByIdService(programId)

					const updatedPrograms = get().programs.map(program => {
						if (program.id === programId) {
							return res.data.program
						}
						return program
					})

					set({
						programs: updatedPrograms,
					})

					return { success: true, data: res.data.program }
				} catch (error: unknown) {
					let message = 'Something went wrong'

					if (error instanceof ApiError) {
						message = error.message
					} else if (error instanceof Error) {
						message = error.message
					}

					console.error(message, error)

					return { success: false, data: null, error: message }
				} finally {
					set({ programByIdLoading: false })
				}
			},

			startDraftProgram: program => {
				if (program) {
					// Deep clone and add keys for list stability
					const draft = JSON.parse(JSON.stringify(program)) as Program
					draft.weeks.forEach(w => {
						w.key = w.key || Crypto.randomUUID()
						w.days.forEach(d => {
							d.key = d.key || Crypto.randomUUID()
						})
					})
					set({ draftProgram: draft })
				} else {
					const newDraft: Program = {
						id: '',
						clientId: Crypto.randomUUID(),
						title: '',
						description: '',
						experienceLevel: 'beginner',
						durationOptions: [4],
						createdBy: '',
						createdAt: '',
						updatedAt: '',
						deletedAt: '',
						weeks: [
							{
								id: '',
								programId: '',
								name: 'Week 1',
								weekIndex: 0,
								key: Crypto.randomUUID(),
								days: Array.from({ length: 7 }).map((_, i) => ({
									id: '',
									weekId: '',
									name: `Day ${i + 1}`,
									dayIndex: i,
									isRestDay: true,
									templateId: null,
									key: Crypto.randomUUID(),
								})),
							},
						],
					}
					set({ draftProgram: newDraft })
				}
			},

			updateDraftProgram: patch => {
				const current = get().draftProgram
				if (!current) return

				set({ draftProgram: { ...current, ...patch } })
			},

			discardDraftProgram: () => {
				set({ draftProgram: null })
			},

			createProgram: async data => {
				try {
					const payload = serializeProgramForApi(data)
					const res = await createProgramService(payload as any)
					if (res.success) {
						const newProgram = res.data.program
						set(state => ({
							programs: [newProgram, ...state.programs],
						}))
						return { success: true, data: newProgram }
					}
					return { success: false, error: res.message || 'Failed to create program' }
				} catch (error: any) {
					return { success: false, error: error.message }
				}
			},

			updateProgram: async (id, data) => {
				try {
					const payload = serializeProgramForApi(data)
					const res = await updateProgramService(id, payload as any)
					if (res.success) {
						const updatedProgram = res.data.program
						set(state => ({
							programs: state.programs.map(p => (p.id === id ? updatedProgram : p)),
						}))
						return { success: true, data: updatedProgram }
					}
					return { success: false, error: res.message || 'Failed to update program' }
				} catch (error: any) {
					return { success: false, error: error.message }
				}
			},
		}),
		{
			name: 'program-store',
			storage: zustandStorage,
			partialize: state => ({
				programs: state.programs ?? [],
			}),
		}
	)
)
