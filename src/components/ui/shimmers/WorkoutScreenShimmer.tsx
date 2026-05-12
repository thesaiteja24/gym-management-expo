import React from 'react'
import { ScrollView, View } from 'react-native'
import { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ShimmerWrapper, SkeletonBlock } from './SkeletonBlock'
import { WorkoutExerciseRowShimmer } from './WorkoutExerciseRowShimmer'

export function WorkoutScreenShimmer() {
  const safeAreaInsets = useSafeAreaInsets()

  return (
    <ShimmerWrapper
      entering={FadeInDown.duration(300).springify()}
      className="flex-1 bg-white dark:bg-black"
    >
      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Skeleton */}
        <View className="mb-6 flex-col gap-4">
          <View className="flex-row items-center gap-4">
            {/* Profile Pic */}
            <SkeletonBlock className="h-12 w-12 rounded-full" />
            {/* User Name */}
            <SkeletonBlock className="h-6 w-[120px] rounded-[4px]" />
          </View>

          {/* Title */}
          <SkeletonBlock className="h-7 w-[70%] rounded-[8px]" />

          {/* Metadata Line */}
          <SkeletonBlock className="h-4 w-[80%] rounded-[4px]" />
        </View>

        {/* Exercise List Skeleton */}
        <View className="gap-4">
          <WorkoutExerciseRowShimmer />
          <WorkoutExerciseRowShimmer />
          <WorkoutExerciseRowShimmer />
        </View>
      </ScrollView>

      {/* Footer Buttons Skeleton */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-neutral-100 bg-white p-4 dark:border-neutral-900 dark:bg-black"
        style={{ paddingBottom: safeAreaInsets.bottom + 16 }}
      >
        <View className="flex-row items-center justify-center gap-4">
          <SkeletonBlock className="h-[42px] w-[66%] rounded-full" />
          <SkeletonBlock className="h-[42px] w-[33%] rounded-full" />
        </View>
      </View>
    </ShimmerWrapper>
  )
}

export default WorkoutScreenShimmer
