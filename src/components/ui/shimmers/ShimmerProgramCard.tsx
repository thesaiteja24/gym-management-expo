import { View } from 'react-native'

/**
 * Skeleton for the global program templates (Library)
 */
export const ShimmerProgramCard = () => {
  return (
    <View className="h-40 gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <View className="flex-col gap-2">
        <View className="h-6 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
        <View className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        <View className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
      </View>

      {/* Chips & Action Button */}
      <View className="mt-2 flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <View className="h-6 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <View className="h-6 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </View>
        <View className="h-10 w-14 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </View>
    </View>
  )
}

/**
 * Skeleton for the user's specific program sessions (Active or Past)
 */
export const ShimmerUserProgramCard = () => {
  return (
    <View className="h-44 w-full gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Top Section */}
      <View className="flex-col items-start justify-between gap-2">
        <View className="h-4 w-3/4 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        <View className="w-full flex-row items-center justify-between gap-2">
          <View className="h-4 w-1/3 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <View className="h-4 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </View>
      </View>

      {/* Progress Bar Placeholder */}
      <View className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800" />

      {/* Footer Placeholder (Simulating Active Program style) */}
      <View className="flex-row items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <View className="flex-1 gap-1">
          <View className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
          <View className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
        </View>
        <View className="h-10 w-14 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </View>
    </View>
  )
}
