import React from 'react'
import { View } from 'react-native'

import { SkeletonBlock } from './SkeletonBlock'

export function WorkoutExerciseRowShimmer() {
  return (
    <View className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <View className="mb-3 flex-row items-center gap-3">
        {/* Thumbnail */}
        <SkeletonBlock className="h-10 w-10 rounded-[6px]" />
        <View className="gap-2">
          {/* Title */}
          <SkeletonBlock className="h-5 w-[120px] rounded-[4px]" />
          {/* Type */}
          <SkeletonBlock className="h-[14px] w-[60px] rounded-[4px]" />
        </View>
      </View>

      <View className="gap-2">
        {/* Set Rows */}
        <View className="flex-row items-center rounded bg-neutral-50 p-2 dark:bg-neutral-800/50">
          <View className="w-10">
            <SkeletonBlock className="h-4 w-4 rounded-[4px]" />
          </View>
          <View className="flex-1">
            <SkeletonBlock className="h-4 w-[40%] rounded-[8px]" />
          </View>
          <View className="w-24 items-end">
            <SkeletonBlock className="h-[14px] w-[80%] rounded-[8px]" />
          </View>
        </View>
        <View className="flex-row items-center rounded bg-neutral-50 p-2 dark:bg-neutral-800/50">
          <View className="w-10">
            <SkeletonBlock className="h-4 w-4 rounded-[4px]" />
          </View>
          <View className="flex-1">
            <SkeletonBlock className="h-4 w-[40%] rounded-[8px]" />
          </View>
          <View className="w-24 items-end">
            <SkeletonBlock className="h-[14px] w-[80%] rounded-[8px]" />
          </View>
        </View>
      </View>
    </View>
  )
}

export default WorkoutExerciseRowShimmer
