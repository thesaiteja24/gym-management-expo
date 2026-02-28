import { useThemeColor } from '@/hooks/useThemeColor'
import { useAuth } from '@/stores/authStore'
import { Ionicons } from '@expo/vector-icons'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const AnalyticsScreen = () => {
	const colors = useThemeColor()
	const weight = useAuth().user?.weight
	const preferredWeightUnit = useAuth().user?.preferredWeightUnit

	const thisWeek = [99.0, 98.6, 98.8, 98.2, 98.0, 98.3, 97.9]

	const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length

	const dailyChange = useMemo(() => {
		return thisWeek[thisWeek.length - 1] - thisWeek[thisWeek.length - 2]
	}, [])

	const isLoss = dailyChange < 0

	return (
		<SafeAreaView edges={['bottom']}>
			<View className="flex-row items-center justify-between gap-4 p-4">
				{/* Best Workout */}
				<View className="h-full w-full flex-1 items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
					<Text className="font-base text-xl text-black dark:text-white">Best Workout</Text>
				</View>
				{/* Weight Card */}
				<View className="h-full w-full flex-1 items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
					<Text className="font-base font-base text-xl text-black dark:text-white">Current Weight</Text>

					<Text className="font-base text-xl font-semibold text-black dark:text-white">
						{thisWeek[thisWeek.length - 1]} {preferredWeightUnit?.toUpperCase()}
					</Text>

					<View
						className={`flex-row items-center gap-2 rounded-full border px-2 py-1 ${
							isLoss ? 'border-green-500 bg-green-500/15' : 'border-red-500 bg-red-500/15'
						}`}
					>
						<Ionicons
							name={isLoss ? 'trending-down-sharp' : 'trending-up-sharp'}
							size={12}
							color={isLoss ? colors.success : colors.danger}
						/>

						<Text className={`font-base text-xs ${isLoss ? 'text-green-600' : 'text-red-600'}`}>
							{Math.abs(dailyChange).toFixed(1)} {preferredWeightUnit?.toUpperCase()}
						</Text>
					</View>

					<View className="absolute bottom-[-8] right-[-8]">
						<Ionicons name="scale-outline" size={120} color={colors.text} opacity={0.04} />
					</View>
				</View>
			</View>
			{/* Overall Stats (volume, etc (bar charts)) */}
			<View className="mb-4 h-full w-full flex-1 items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
				<Text className="font-base text-xl text-black dark:text-white">Overall Stats</Text>
			</View>
			{/* Habit progress */}
			<View className="mb-4 h-full w-full flex-1 items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
				<Text className="font-base text-xl text-black dark:text-white">Habit Progress</Text>
			</View>
			{/* Muscle Heatmap */}
			<View className="mb-4 h-full w-full flex-1 items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
				<Text className="font-base text-xl text-black dark:text-white">Muscle Heatmap</Text>
			</View>
		</SafeAreaView>
	)
}

export default AnalyticsScreen
