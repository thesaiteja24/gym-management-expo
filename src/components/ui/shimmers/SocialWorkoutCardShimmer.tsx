import { View } from 'react-native'

import { SkeletonBlock } from './SkeletonBlock'

export function SocialWorkoutCardShimmer() {
  return (
    <View className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <View className="mb-4 flex-row items-center gap-3">
        <SkeletonBlock className="h-11 w-11 rounded-full" />
        <View className="flex-1 flex-col gap-2">
          <SkeletonBlock className="h-4 w-[70%] rounded" />
          <SkeletonBlock className="h-4 w-[50%] rounded" />
        </View>
      </View>

      <View className="mb-4 gap-2">
        <SkeletonBlock className="h-[18px] w-[60%] rounded" />
      </View>

      {/* Meta row */}
      <View className="mb-4 flex-row justify-between gap-4">
        <SkeletonBlock className="h-[14px] w-[45%] rounded" />
        <SkeletonBlock className="h-[14px] w-[45%] rounded" />
      </View>

      {/* Exercise previews */}
      <View className="mb-2 flex-row items-center gap-3">
        <SkeletonBlock className="h-11 w-11 rounded-full" />
        <SkeletonBlock className="h-4 w-[70%] rounded" />
      </View>
      <View className="mb-2 flex-row items-center gap-3">
        <SkeletonBlock className="h-11 w-11 rounded-full" />
        <SkeletonBlock className="h-4 w-[70%] rounded" />
      </View>
      <View className="mb-2 flex-row items-center gap-3">
        <SkeletonBlock className="h-11 w-11 rounded-full" />
        <SkeletonBlock className="h-4 w-[70%] rounded" />
      </View>
    </View>
  )
}

export default SocialWorkoutCardShimmer
