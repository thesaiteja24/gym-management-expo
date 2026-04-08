import React from 'react'
import { View } from 'react-native'

export default function SkeletonProgramCard() {
	return (
		<View className="ml-4 w-[80%] gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
			{/* Header */}
			<View className="flex-col gap-1">
				<View className="h-6 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
				<View className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
				<View className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
			</View>

			{/* Bottom Row */}
			<View className="flex-row items-center justify-between gap-2">
				{/* Chips */}
				<View className="flex-row items-center gap-2">
					<View className="h-6 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
					<View className="h-6 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
				</View>

				{/* Button */}
				<View className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
			</View>
		</View>
	)
}
