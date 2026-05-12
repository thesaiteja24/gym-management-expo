import React from 'react'
import { View } from 'react-native'

import { ShimmerWrapper, SkeletonBlock } from './SkeletonBlock'

export function UserProgramCardShimmer() {
  return (
    <ShimmerWrapper className="h-44 w-full gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Top Section */}
      <View className="flex-col items-start justify-between gap-2">
        <SkeletonBlock className="h-4 w-[75%] rounded-lg" />
        <View className="w-full flex-row items-center justify-between gap-2">
          <SkeletonBlock className="h-4 w-[33%] rounded-lg" />
          <SkeletonBlock className="h-4 w-12 rounded-full" />
        </View>
      </View>

      {/* Progress Bar Placeholder */}
      <SkeletonBlock className="h-2 w-full rounded-full" />

      {/* Footer Placeholder (Simulating Active Program style) */}
      <View className="flex-row items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <View className="flex-1 gap-1">
          <SkeletonBlock className="h-3 w-16 rounded-[4px]" />
          <SkeletonBlock className="h-5 w-[75%] rounded-[4px]" />
        </View>
        <SkeletonBlock className="h-10 w-14 rounded-full" />
      </View>
    </ShimmerWrapper>
  )
}

export default UserProgramCardShimmer
