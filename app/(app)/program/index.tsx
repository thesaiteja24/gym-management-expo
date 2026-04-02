import { Button } from '@/components/ui/Button'
import TemplateSelectionModal, { TemplateSelectionModalHandle } from '@/components/workout/TemplateSelectionModal'
import { ProgramDay, ProgramWeek } from '@/stores/program/types'
import { useProgram } from '@/stores/programStore'
import { useTemplate } from '@/stores/templateStore'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as Crypto from 'expo-crypto'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

export default function ProgramEditor() {
	const insets = useSafeAreaInsets()
	const navigation = useNavigation()
	const params = useLocalSearchParams()
	const isEditing = params.mode === 'edit'

	const {
		programs,
		draftProgram,
		startDraftProgram,
		updateDraftProgram,
		discardDraftProgram,
		createProgram,
		updateProgram,
	} = useProgram()
	const { templates, getAllTemplates } = useTemplate()
	const [saving, setSaving] = useState(false)

	const templateSelectionModalRef = useRef<TemplateSelectionModalHandle>(null)
	const [activeSelectionContext, setActiveSelectionContext] = useState<{
		weekIndex: number
		dayIndex: number
	} | null>(null)

	// Fetch templates so user can select them
	useEffect(() => {
		getAllTemplates()
	}, [getAllTemplates])

	// Init Draft
	useEffect(() => {
		if (isEditing) {
			if (!params.id) {
				router.back()
				return
			}
			// Avoid infinite loop: only start draft if it's not already set for this ID
			if (draftProgram?.id === params.id) return

			const existing = programs.find(p => p.id === params.id)
			if (existing) {
				startDraftProgram(JSON.parse(JSON.stringify(existing)))
			} else {
				router.back()
			}
		} else {
			// For new program, only start if no draft exists
			if (!draftProgram || draftProgram.id !== '') {
				startDraftProgram()
			}
		}
	}, [isEditing, params.id, programs, startDraftProgram, draftProgram])

	const handleSave = useCallback(async () => {
		if (!draftProgram) return
		if (!draftProgram.title.trim()) {
			Toast.show({ type: 'error', text1: 'Title required', text2: 'Please enter a name for your program.' })
			return
		}

		setSaving(true)
		try {
			let res
			if (isEditing && draftProgram.id) {
				res = await updateProgram(draftProgram.id, draftProgram as any)
			} else {
				res = await createProgram(draftProgram as any)
			}

			if (res.success) {
				Toast.show({
					type: 'success',
					text1: isEditing ? 'Program updated' : 'Program created',
				})
				discardDraftProgram()
				router.back()
			} else {
				Toast.show({
					type: 'error',
					text1: isEditing ? 'Failed to update program' : 'Failed to create program',
					text2: res.error,
				})
			}
		} catch (error: any) {
			console.error('Error in program handleSave', error)
			Toast.show({
				type: 'error',
				text1: 'Save error',
				text2: error.message || 'An unexpected error occurred.',
			})
		} finally {
			setSaving(false)
		}
	}, [draftProgram, isEditing, createProgram, updateProgram, discardDraftProgram])

	useEffect(() => {
		navigation.setOptions({
			title: isEditing ? 'Edit Program' : 'New Program',
			onLeftPress: () => {
				discardDraftProgram()
				router.back()
			},
			headerBackButtonMenuEnabled: false,
			rightIcons: [
				{
					name: 'checkmark-done',
					onPress: saving ? undefined : handleSave,
					disabled: saving,
					color: 'green',
				},
			],
		})
	}, [navigation, saving, isEditing, handleSave, discardDraftProgram])

	if (!draftProgram) return null

	const addWeek = () => {
		const newWeek: ProgramWeek = {
			key: Crypto.randomUUID(),
			name: `Week ${(draftProgram.programWeeks?.length || 0) + 1}`,
			weekIndex: draftProgram.programWeeks?.length || 0,
			type: 'base',
			referenceWeekKey: null,
			days: [],
		}
		updateDraftProgram({ programWeeks: [...(draftProgram.programWeeks || []), newWeek] })
	}

	const addDayToWeek = (weekIndex: number) => {
		if (!draftProgram.programWeeks) return
		const newWeeks = [...draftProgram.programWeeks]
		const daysCount = newWeeks[weekIndex].days.length

		if (daysCount >= 7) {
			Toast.show({
				type: 'error',
				text1: 'Limit reached',
				text2: 'A week cannot have more than 7 days.',
			})
			return
		}

		const newDay: ProgramDay = {
			key: Crypto.randomUUID(),
			name: `Day ${daysCount + 1}`,
			dayIndex: daysCount,
			isRestDay: false,
		}
		newWeeks[weekIndex].days.push(newDay)
		updateDraftProgram({ programWeeks: newWeeks })
	}

	const updateDay = (weekIndex: number, dayIndex: number, patch: Partial<ProgramDay>) => {
		if (!draftProgram.programWeeks) return
		const newWeeks = [...draftProgram.programWeeks]
		newWeeks[weekIndex].days[dayIndex] = { ...newWeeks[weekIndex].days[dayIndex], ...patch }
		updateDraftProgram({ programWeeks: newWeeks })
	}

	const removeDay = (weekIndex: number, dayIndex: number) => {
		if (!draftProgram.programWeeks) return
		const newWeeks = [...draftProgram.programWeeks]
		newWeeks[weekIndex].days.splice(dayIndex, 1)
		// re-index days
		newWeeks[weekIndex].days = newWeeks[weekIndex].days.map((d, i) => ({ ...d, dayIndex: i }))
		updateDraftProgram({ programWeeks: newWeeks })
	}

	const removeWeek = (weekIndex: number) => {
		if (!draftProgram.programWeeks) return
		const newWeeks = [...draftProgram.programWeeks]
		const deletedWeekKey = newWeeks[weekIndex].key
		newWeeks.splice(weekIndex, 1)
		// re-index weeks and clear dangling referenceWeekKey refs
		const reindexed = newWeeks.map((w, i) => ({
			...w,
			weekIndex: i,
			referenceWeekKey: w.referenceWeekKey === deletedWeekKey ? null : w.referenceWeekKey,
		}))
		updateDraftProgram({ programWeeks: reindexed })
	}

	return (
		<BottomSheetModalProvider>
			<SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['bottom']}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
						{/* Header Inputs */}
						<View className="border-b border-neutral-200 p-4 dark:border-neutral-800">
							<TextInput
								value={draftProgram.title}
								onChangeText={t => updateDraftProgram({ title: t })}
								placeholder="Program Name e.g. Hypertrophy PPL"
								placeholderTextColor="#9ca3af"
								className="mb-2 text-xl font-semibold text-black dark:text-white"
							/>
							<TextInput
								value={draftProgram.description || ''}
								onChangeText={t => updateDraftProgram({ description: t || null })}
								placeholder="Description (optional)"
								placeholderTextColor="#9ca3af"
								multiline
								className="mb-4 max-h-20 text-base text-neutral-600 dark:text-neutral-400"
							/>

							{/* Program Settings */}
							<View className="mb-4 flex-row items-center justify-between">
								<View className="flex-1">
									<Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
										Experience Level
									</Text>
									<View className="flex-row gap-2">
										{(['beginner', 'intermediate', 'advanced'] as const).map(level => (
											<TouchableOpacity
												key={level}
												onPress={() => updateDraftProgram({ experienceLevel: level })}
												className={`rounded-full border px-3 py-1.5 ${
													draftProgram.experienceLevel === level
														? 'border-blue-600 bg-blue-600'
														: 'border-neutral-200 dark:border-neutral-800'
												}`}
											>
												<Text
													className={`text-xs capitalize ${
														draftProgram.experienceLevel === level
															? 'font-semibold text-white'
															: 'text-neutral-600 dark:text-neutral-400'
													}`}
												>
													{level}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							</View>

							<View>
								<Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
									Duration Options (Weeks)
								</Text>
								<View className="flex-row flex-wrap gap-2">
									{[4, 6, 8, 10, 12, 16].map(weeks => {
										const isSelected = draftProgram.durationOptions.includes(weeks)
										return (
											<TouchableOpacity
												key={weeks}
												onPress={() => {
													const currentOptions = [...draftProgram.durationOptions]
													if (isSelected) {
														if (currentOptions.length > 1) {
															updateDraftProgram({
																durationOptions: currentOptions.filter(
																	o => o !== weeks
																),
															})
														}
													} else {
														updateDraftProgram({
															durationOptions: [...currentOptions, weeks].sort(
																(a, b) => a - b
															),
														})
													}
												}}
												className={`rounded-lg border px-3 py-1.5 ${
													isSelected
														? 'border-neutral-800 bg-neutral-800 dark:border-neutral-200 dark:bg-neutral-200'
														: 'border-neutral-200 dark:border-neutral-800'
												}`}
											>
												<Text
													className={`text-xs ${
														isSelected
															? 'font-semibold text-white dark:text-black'
															: 'text-neutral-600 dark:text-neutral-400'
													}`}
												>
													{weeks}
												</Text>
											</TouchableOpacity>
										)
									})}
								</View>
							</View>
						</View>

						{/* Weeks & Days lists */}
						<View className="p-4">
							{draftProgram.programWeeks?.map((week, wIndex) => (
								<View
									key={week.key}
									className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
								>
									<View className="mb-4 flex-row items-center justify-between">
										<View className="mr-4 flex-1">
											<TextInput
												value={week.name}
												onChangeText={t => {
													const newW = [...draftProgram.programWeeks!]
													newW[wIndex].name = t
													updateDraftProgram({ programWeeks: newW })
												}}
												className="mb-1 text-lg font-bold text-black dark:text-white"
											/>
											<View className="flex-row items-center gap-2">
												<View className="flex-row gap-2">
													{(['base', 'progression', 'deload'] as const).map(type => (
														<TouchableOpacity
															key={type}
															onPress={() => {
																const newW = [...draftProgram.programWeeks!]
																newW[wIndex].type = type
																if (type === 'base') {
																	newW[wIndex].referenceWeekKey = null
																}
																updateDraftProgram({ programWeeks: newW })
															}}
															className={`rounded-md border px-2 py-0.5 ${
																week.type === type
																	? 'border-neutral-200 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-700'
																	: 'border-transparent'
															}`}
														>
															<Text
																className={`text-[10px] uppercase tracking-tighter ${
																	week.type === type
																		? 'font-bold text-black dark:text-white'
																		: 'text-neutral-400'
																}`}
															>
																{type}
															</Text>
														</TouchableOpacity>
													))}
												</View>

												{week.type !== 'base' && (
													<View className="ml-2 flex-1">
														<View className="flex-row items-center justify-between">
															<View className="flex-row flex-wrap gap-1">
																<Text className="text-[10px] uppercase text-neutral-400">
																	Ref:
																</Text>
																{draftProgram.programWeeks
																	?.filter(
																		w => w.type === 'base' && w.key !== week.key
																	)
																	.map(baseWeek => (
																		<TouchableOpacity
																			key={baseWeek.key}
																			onPress={() => {
																				const newW = [
																					...draftProgram.programWeeks!,
																				]
																				newW[wIndex].referenceWeekKey =
																					baseWeek.key
																				updateDraftProgram({
																					programWeeks: newW,
																				})
																			}}
																			className={`rounded-md border px-1.5 py-0.5 ${
																				week.referenceWeekKey === baseWeek.key
																					? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
																					: 'border-neutral-200 dark:border-neutral-800'
																			}`}
																		>
																			<Text
																				className={`text-[9px] ${
																					week.referenceWeekKey ===
																					baseWeek.key
																						? 'font-bold text-blue-600'
																						: 'text-neutral-500'
																				}`}
																			>
																				{baseWeek.name}
																			</Text>
																		</TouchableOpacity>
																	))}
																{draftProgram.programWeeks?.filter(
																	w => w.type === 'base' && w.key !== week.key
																).length === 0 && (
																	<Text className="text-[9px] italic text-neutral-400">
																		No base weeks
																	</Text>
																)}
															</View>

															{week.referenceWeekKey && (
																<TouchableOpacity
																	onPress={() => {
																		const refW = draftProgram.programWeeks?.find(
																			w => w.key === week.referenceWeekKey
																		)
																		if (refW) {
																			const newW = [...draftProgram.programWeeks!]
																			newW[wIndex].days = refW.days
																				.slice(0, 7)
																				.map(d => ({
																					...d,
																					key: Crypto.randomUUID(),
																					id: undefined,
																				}))
																			updateDraftProgram({ programWeeks: newW })
																			Toast.show({
																				type: 'success',
																				text1: 'Days synced from ' + refW.name,
																			})
																		}
																	}}
																	className="rounded-md bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800"
																>
																	<Text className="text-[9px] font-bold text-neutral-600 dark:text-neutral-300">
																		SYNC DAYS
																	</Text>
																</TouchableOpacity>
															)}
														</View>
													</View>
												)}
											</View>
										</View>
										<TouchableOpacity onPress={() => removeWeek(wIndex)}>
											<Ionicons name="trash-outline" size={20} color="red" />
										</TouchableOpacity>
									</View>

									{week.days.map((day, dIndex) => (
										<View
											key={day.key}
											className="mb-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-black"
										>
											<View className="mb-2 flex-row items-center justify-between">
												<TextInput
													value={day.name}
													onChangeText={t => updateDay(wIndex, dIndex, { name: t })}
													className="flex-1 font-medium text-black dark:text-white"
												/>
												<TouchableOpacity onPress={() => removeDay(wIndex, dIndex)}>
													<Ionicons name="close-circle" size={20} color="#9ca3af" />
												</TouchableOpacity>
											</View>

											<View className="mb-2 flex-row items-center justify-between">
												<Text className="text-neutral-600 dark:text-neutral-400">
													Rest Day?
												</Text>
												<Switch
													value={day.isRestDay}
													onValueChange={val =>
														updateDay(wIndex, dIndex, {
															isRestDay: val,
															templateId: val ? null : day.templateId,
														})
													}
												/>
											</View>

											{!day.isRestDay && (
												<View className="mt-2">
													<Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
														Selected Template
													</Text>

													{day.templateId ? (
														<View className="mb-2 flex-row items-center justify-between rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
															<View className="mr-2 flex-1">
																<Text
																	className="text-sm font-medium text-black dark:text-white"
																	numberOfLines={1}
																>
																	{templates.find(t => t.id === day.templateId)
																		?.title || 'Template Not Found'}
																</Text>
															</View>
															<Button
																title="Change"
																variant="secondary"
																className="!px-3 !py-1"
																onPress={() => {
																	setActiveSelectionContext({
																		weekIndex: wIndex,
																		dayIndex: dIndex,
																	})
																	templateSelectionModalRef.current?.present()
																}}
															/>
														</View>
													) : (
														<View className="mt-1 flex-row items-center justify-start gap-3">
															<Button
																title="Select Existing"
																variant="secondary"
																className="flex-1"
																onPress={() => {
																	setActiveSelectionContext({
																		weekIndex: wIndex,
																		dayIndex: dIndex,
																	})
																	templateSelectionModalRef.current?.present()
																}}
															/>
															<Button
																title="Create New"
																variant="primary"
																className="flex-1"
																onPress={() => {
																	router.push({
																		pathname: '/(app)/template/editor',
																		params: {
																			context: 'program',
																			weekIndex: wIndex,
																			dayIndex: dIndex,
																		},
																	} as any)
																}}
															/>
														</View>
													)}
												</View>
											)}
										</View>
									))}

									<Button
										title={`Add Day to ${week.name}`}
										variant="outline"
										leftIcon={<Ionicons name="add" size={16} color="black" />}
										onPress={() => {
											addDayToWeek(wIndex)
										}}
										disabled={week.days.length >= 7}
										onDisabledPress={() => {
											Toast.show({
												type: 'info',
												text1: 'Limit reached',
												text2: 'A week cannot have more than 7 days.',
											})
										}}
										className="mt-2 text-sm"
									/>
								</View>
							))}

							<Button
								title="Add Week"
								variant="primary"
								leftIcon={<Ionicons name="add" size={20} color="white" />}
								onPress={addWeek}
								className="mt-4"
							/>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>

				<TemplateSelectionModal
					ref={templateSelectionModalRef}
					templates={templates}
					onSelect={templateId => {
						if (activeSelectionContext) {
							updateDay(activeSelectionContext.weekIndex, activeSelectionContext.dayIndex, { templateId })
						}
					}}
				/>
			</SafeAreaView>
		</BottomSheetModalProvider>
	)
}
