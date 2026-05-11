import React from 'react'
import { View } from 'react-native'

import { SkeletonBlock } from './SkeletonBlock'

export function UserStreakCardShimmer() {
  return (
    <View className="mb-4 rounded-2xl border border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Month */}
      <SkeletonBlock className="h-6 w-[160px] rounded-[6px]" />

      {/* Motivation line */}
      <View className="mt-3">
        <SkeletonBlock className="h-4 w-full rounded-[8px]" />
      </View>

      {/* Days */}
      <View className="mt-4 flex-row justify-between">
        <View className="items-center">
          <SkeletonBlock className="h-3 w-6 rounded-[4px]" />
          <View className="mt-2">
            <SkeletonBlock className="h-12 w-10 rounded-full" />
          </View>
        </View>
        <View className="items-center">
          <SkeletonBlock className="h-3 w-6 rounded-[4px]" />
          <View className="mt-2">
            <SkeletonBlock className="h-12 w-10 rounded-full" />
          </View>
        </View>
        <View className="items-center">
          <SkeletonBlock className="h-3 w-6 rounded-[4px]" />
          <View className="mt-2">
            <SkeletonBlock className="h-12 w-10 rounded-full" />
          </View>
        </View>
        <View className="items-center">
          <SkeletonBlock className="h-3 w-6 rounded-[4px]" />
          <View className="mt-2">
            <SkeletonBlock className="h-12 w-10 rounded-full" />
          </View>
        </View>
        <View className="items-center">
          <SkeletonBlock className="h-3 w-6 rounded-[4px]" />
          <View className="mt-2">
            <SkeletonBlock className="h-12 w-10 rounded-full" />
          </View>
        </View>
        <View className="items-center">
          <SkeletonBlock className="h-3 w-6 rounded-[4px]" />
          <View className="mt-2">
            <SkeletonBlock className="h-12 w-10 rounded-full" />
          </View>
        </View>
        <View className="items-center">
          <SkeletonBlock className="h-3 w-6 rounded-[4px]" />
          <View className="mt-2">
            <SkeletonBlock className="h-12 w-10 rounded-full" />
          </View>
        </View>
      </View>
    </View>
  )
}

export default UserStreakCardShimmer
