import { Button } from '@/components/ui/Button'
import { UserProgram } from '@/types/programApi'

import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Link, router } from 'expo-router'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

export default function ActiveProgramCard({ program }: { program: UserProgram }) {
	const totalDays = program.durationWeeks * 7
	const completedDays = program.progress.currentWeek * 7 + program.progress.currentDay
	const progressPercent = Math.round(Math.min(100, Math.max(0, (completedDays / totalDays) * 100)))

	const handleStart = () => {
		router.push(`/(app)/user-program/${program.id}`)
	}

	return (
		<Link
			href={`/(app)/user-program/${program.id}`}
			onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
			asChild
		>
			<Pressable className="w-full gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
				{/* Top Section: Title and Week Info */}
				<View className="flex-row items-end justify-between">
					<View className="flex-1 gap-1">
						<Text className="line-clamp-1 text-lg font-semibold text-black dark:text-white">
							{program.program.title}
						</Text>
						<Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
							Week {program.progress.currentWeek + 1} • Day {program.progress.currentDay + 1}
						</Text>
					</View>
					<View className="rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900/30">
						<Text className="text-xs font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</Text>
					</View>
				</View>

				{/* Progress Bar */}
				<View className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
					<View className="h-full bg-blue-600" style={{ width: `${progressPercent}%` }} />
				</View>

				{/* Footer: Next Workout and Action Button */}
				<View className="flex-row items-center justify-between">
					<View className="flex-1">
						<Text className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
							Next Up
						</Text>
						<Text
							className={`mt-1 text-base font-semibold ${
								program.progress.isRestDay ? 'text-emerald-500' : 'text-black dark:text-white'
							}`}
						>
							{program.progress.isRestDay ? 'Rest Day' : program.progress.workoutTitle || 'Next Workout'}
						</Text>
					</View>

					<Button
						title=""
						onPress={e => {
							e.preventDefault()
							handleStart()
						}}
						rightIcon={<MaterialCommunityIcons name="chevron-right" size={24} color="white" />}
						variant="primary"
						className="rounded-full"
					/>
				</View>
			</Pressable>
		</Link>
	)
}
