import { memo } from 'react'
import { View } from 'react-native'
import { FadeInDown } from 'react-native-reanimated'

import { ShimmerWrapper, SkeletonBlock } from './SkeletonBlock'
import { SocialWorkoutCardShimmer } from './SocialWorkoutCardShimmer'

/* ──────────────────────────────────────────────
   Training Activity Skeleton
────────────────────────────────────────────── */

const SkeletonTrainingActivity = memo(() => {
  return (
    <View className="mb-6 h-72 gap-6 rounded-3xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <SkeletonBlock className="h-5 w-[40%] rounded-[8px]" />
      <View className="flex-1 flex-row items-end justify-between gap-2 px-2 pb-4">
        <SkeletonBlock className="h-[40%] w-[8%] rounded-none" />
        <SkeletonBlock className="h-[70%] w-[8%] rounded-none" />
        <SkeletonBlock className="h-[69%] w-[8%] rounded-none" />
        <SkeletonBlock className="h-[45%] w-[8%] rounded-none" />
        <SkeletonBlock className="h-[90%] w-[8%] rounded-none" />
        <SkeletonBlock className="h-[55%] w-[8%] rounded-none" />
        <SkeletonBlock className="h-[60%] w-[8%] rounded-none" />
        <SkeletonBlock className="h-[80%] w-[8%] rounded-none" />
      </View>
      <View className="flex-row justify-center gap-2">
        <SkeletonBlock className="h-2 w-2 rounded-full" />
        <SkeletonBlock className="h-2 w-2 rounded-full" />
        <SkeletonBlock className="h-2 w-2 rounded-full" />
      </View>
    </View>
  )
})
SkeletonTrainingActivity.displayName = 'SkeletonTrainingActivity'

/* ──────────────────────────────────────────────
   Top Lifts Skeleton
────────────────────────────────────────────── */

const SkeletonTopLifts = memo(() => {
  return (
    <View className="mb-6 gap-4">
      <View className="flex-row items-center justify-between">
        <SkeletonBlock className="h-6 w-[30%] rounded-[8px]" />
      </View>
      <View className="flex-row gap-4">
        <View className="w-44 rounded-3xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <View className="mb-4 flex-row items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-[12px]" />
            <View className="gap-1">
              <SkeletonBlock className="h-4 w-[60px] rounded-[8px]" />
              <SkeletonBlock className="h-3 w-[40px] rounded-[8px]" />
            </View>
          </View>
          <SkeletonBlock className="h-8 w-full rounded-[8px]" />
        </View>

        <View className="w-44 rounded-3xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <View className="mb-4 flex-row items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-[12px]" />
            <View className="gap-1">
              <SkeletonBlock className="h-4 w-[60px] rounded-[8px]" />
              <SkeletonBlock className="h-3 w-[40px] rounded-[8px]" />
            </View>
          </View>
          <SkeletonBlock className="h-8 w-full rounded-[8px]" />
        </View>
      </View>
    </View>
  )
})
SkeletonTopLifts.displayName = 'SkeletonTopLifts'

/* ──────────────────────────────────────────────
   Profile Screen Skeleton (export)
────────────────────────────────────────────── */

export const ProfileScreenShimmer = memo(() => {
  return (
    <ShimmerWrapper entering={FadeInDown.duration(300).springify()} className="flex-1">
      {/* Header Skeleton */}
      <View className="mb-6 flex-row items-center gap-4">
        <SkeletonBlock className="h-[75px] w-[75px] rounded-full" />
        <View className="flex-1 gap-2">
          <SkeletonBlock className="h-6 w-[60%] rounded-[8px]" />
          <View className="flex-row gap-4">
            <View className="gap-1">
              <SkeletonBlock className="h-3 w-[40px] rounded-[8px]" />
              <SkeletonBlock className="h-5 w-[30px] rounded-[8px]" />
            </View>
            <View className="gap-1">
              <SkeletonBlock className="h-3 w-[40px] rounded-[8px]" />
              <SkeletonBlock className="h-5 w-[30px] rounded-[8px]" />
            </View>
            <View className="gap-1">
              <SkeletonBlock className="h-3 w-[40px] rounded-[8px]" />
              <SkeletonBlock className="h-5 w-[30px] rounded-[8px]" />
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons Skeleton */}
      <View className="mb-6 flex-row gap-4">
        <SkeletonBlock className="h-[42px] w-[65%] rounded-full" />
        <SkeletonBlock className="h-[42px] w-[30%] rounded-full" />
      </View>

      {/* Training Activity Skeleton */}
      <SkeletonTrainingActivity />

      {/* Top Lifts Skeleton */}
      <SkeletonTopLifts />

      {/* Section Title */}
      <View className="mb-4">
        <SkeletonBlock className="h-6 w-[40%] rounded-[8px]" />
      </View>

      {/* Workouts List Skeleton */}
      <SocialWorkoutCardShimmer />
      <SocialWorkoutCardShimmer />
    </ShimmerWrapper>
  )
})
ProfileScreenShimmer.displayName = 'ProfileScreenShimmer'

export default ProfileScreenShimmer
