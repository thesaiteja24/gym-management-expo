import { convertWeight, displayWeight } from '@/utils/converter'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

interface NutritionTargetsCardProps {
	nutritionPlan: any
	fitnessProfile: any
	riskBadge: { label: string; color: string; bg: string } | null
	bmr: number | null
	colors: any
	preferredWeightUnit: string
}

export function NutritionTargetsCard({
	nutritionPlan,
	fitnessProfile,
	riskBadge,
	bmr,
	colors,
	preferredWeightUnit,
}: NutritionTargetsCardProps) {
	if (!nutritionPlan) return null

	return (
		<Animated.View entering={FadeInDown.delay(180).duration(500)} className="px-4 pb-4">
			<View className="w-full rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
				<View className="mb-4 flex-row items-center justify-between">
					<Text className="text-xl font-bold text-black dark:text-white">Nutrition Targets</Text>
					<View className="flex-row gap-2">
						{riskBadge && (
							<View className={`rounded-full px-3 py-1 ${riskBadge.bg}`}>
								<Text className={`text-xs font-semibold ${riskBadge.color}`}>{riskBadge.label}</Text>
							</View>
						)}
						<View
							className={`rounded-full px-3 py-1 ${nutritionPlan.deficitOrSurplus && nutritionPlan.deficitOrSurplus > 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
						>
							<Text
								className={`text-xs font-semibold ${nutritionPlan.deficitOrSurplus && nutritionPlan.deficitOrSurplus > 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}
							>
								{nutritionPlan.deficitOrSurplus && nutritionPlan.deficitOrSurplus > 0
									? 'Surplus'
									: 'Deficit'}
							</Text>
						</View>
					</View>
				</View>
				<View className="flex-row gap-4">
					<View className="flex-1 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
						<MaterialCommunityIcons name="fire" size={24} color={colors.primary} className="mb-2" />
						<Text className="mb-1 text-2xl font-bold text-black dark:text-white">
							{nutritionPlan.caloriesTarget}
						</Text>
						<Text className="text-xs text-neutral-500 dark:text-neutral-400">Calories/Day</Text>
					</View>
					<View className="flex-1 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
						<MaterialCommunityIcons name="food-steak" size={24} color={colors.primary} className="mb-2" />
						<Text className="mb-1 text-2xl font-bold text-black dark:text-white">
							{nutritionPlan.proteinTarget}g
						</Text>
						<Text className="text-xs text-neutral-500 dark:text-neutral-400">Protein/Day</Text>
					</View>
				</View>

				{/* Detailed Stats Sub-Block */}
				<View className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800/80">
					<Text className="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
						Biological Details
					</Text>
					<View className="flex-row flex-wrap gap-y-3">
						<View className="w-1/2 pr-2">
							<Text className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">Est. TDEE</Text>
							<Text className="font-semibold text-black dark:text-white">
								{nutritionPlan.calculatedTDEE ? `${nutritionPlan.calculatedTDEE} kcal` : '--'}
							</Text>
						</View>
						{bmr && (
							<View className="w-1/2 pl-2">
								<Text className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">Est. BMR</Text>
								<Text className="font-semibold text-black dark:text-white">{bmr} kcal</Text>
							</View>
						)}
						{fitnessProfile?.targetWeight && (
							<View className="w-1/2 pr-2">
								<Text className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
									Target Weight
								</Text>
								<Text className="font-semibold text-black dark:text-white">
									{displayWeight(
										convertWeight(fitnessProfile.targetWeight, {
											from: 'kg',
											to: preferredWeightUnit as any,
										})
									)}{' '}
									{preferredWeightUnit.toUpperCase()}
								</Text>
							</View>
						)}
						{fitnessProfile?.targetDate && (
							<View className="w-1/2 pl-2">
								<Text className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">Target Date</Text>
								<Text className="font-semibold text-black dark:text-white">
									{new Date(fitnessProfile.targetDate).toLocaleDateString(undefined, {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</Text>
							</View>
						)}
					</View>
				</View>
			</View>
		</Animated.View>
	)
}
