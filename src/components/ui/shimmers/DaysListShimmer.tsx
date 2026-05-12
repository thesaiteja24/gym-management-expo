import React from 'react'
import { View } from 'react-native'
import { FadeInDown } from 'react-native-reanimated'

import { ShimmerWrapper, SkeletonBlock } from './SkeletonBlock'

export function DaysListShimmer({ count = 6 }: { count?: number }) {
  return (
    <ShimmerWrapper entering={FadeInDown.duration(300).springify()} className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className="flex-row items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <View className="flex-1">
            <SkeletonBlock className="mb-2 h-[18px] w-[55%] rounded-[6px]" />
            <SkeletonBlock className="h-[14px] w-[40%] rounded-[6px]" />
          </View>
          <SkeletonBlock className="h-10 w-10 rounded-full" />
        </View>
      ))}
    </ShimmerWrapper>
  )
}

export default DaysListShimmer
