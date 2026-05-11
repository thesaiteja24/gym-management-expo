import React from 'react'
import { ScrollView, View } from 'react-native'
import { FadeInDown } from 'react-native-reanimated'

import { ShimmerWrapper, SkeletonBlock } from './SkeletonBlock'
import { WorkoutExerciseRowShimmer } from './WorkoutExerciseRowShimmer'

export function TemplateScreenShimmer() {
  return (
    <ShimmerWrapper
      entering={FadeInDown.duration(300).springify()}
      className="flex-1 bg-white dark:bg-black"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Skeleton */}
        <View className="border-b border-neutral-100 pb-4 dark:border-neutral-900">
          {/* Title */}
          <SkeletonBlock className="h-[36px] w-[70%] rounded-[8px]" />

          {/* Notes Placeholder */}
          <View className="mb-4 mt-4 gap-2">
            <SkeletonBlock className="h-4 w-full rounded-[8px]" />
            <SkeletonBlock className="h-4 w-[90%] rounded-[8px]" />
          </View>

          {/* Metadata Pills */}
          <View className="flex-row gap-4">
            <SkeletonBlock className="h-8 w-[80px] rounded-full" />
            <SkeletonBlock className="h-8 w-[120px] rounded-full" />
          </View>
        </View>

        {/* Exercise List Skeleton */}
        <View className="gap-4 py-4">
          <WorkoutExerciseRowShimmer />
          <WorkoutExerciseRowShimmer />
          <WorkoutExerciseRowShimmer />
        </View>
      </ScrollView>

      {/* Footer Buttons Skeleton */}
      <View className="absolute bottom-0 left-0 right-0 mb-2 px-4">
        <View className="flex-row items-center justify-center gap-4">
          <SkeletonBlock className="h-8 w-[33%] rounded-full" />
          <SkeletonBlock className="h-8 w-[66%] rounded-full" />
        </View>
      </View>
    </ShimmerWrapper>
  )
}

export default TemplateScreenShimmer
