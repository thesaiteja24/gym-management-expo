import { View } from 'react-native'
import { FadeInDown } from 'react-native-reanimated'

import { ShimmerWrapper, SkeletonBlock } from './SkeletonBlock'

export function ProgramDetailsShimmer() {
  return (
    <ShimmerWrapper entering={FadeInDown.duration(300).springify()} className="flex-1">
      {/* Header Section */}
      <View className="mb-2">
        <SkeletonBlock className="h-9 w-[70%] rounded-[8px]" />
      </View>
      <View className="mb-6">
        <SkeletonBlock className="mb-2 h-[18px] w-[90%] rounded-[4px]" />
        <SkeletonBlock className="mb-2 h-[18px] w-[90%] rounded-[4px]" />
        <SkeletonBlock className="mb-2 h-[18px] w-[90%] rounded-[4px]" />
        <SkeletonBlock className="mb-2 h-[18px] w-[90%] rounded-[4px]" />
        <SkeletonBlock className="h-[18px] w-[40%] rounded-[4px]" />
      </View>

      {/* Schedule Section Title */}
      <View className="mb-4">
        <SkeletonBlock className="h-6 w-[50%] rounded-[6px]" />
      </View>

      {/* Week 1 Placeholder */}
      <View className="mb-6">
        <View className="mb-3">
          <SkeletonBlock className="h-5 w-[30%] rounded-[6px]" />
        </View>
        <View className="gap-2">
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <View className="flex-1">
              <SkeletonBlock className="mb-2 h-[18px] w-[40%] rounded-[4px]" />
              <SkeletonBlock className="h-[14px] w-[30%] rounded-[4px]" />
            </View>
            <SkeletonBlock className="h-6 w-6 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <View className="flex-1">
              <SkeletonBlock className="mb-2 h-[18px] w-[40%] rounded-[4px]" />
              <SkeletonBlock className="h-[14px] w-[30%] rounded-[4px]" />
            </View>
            <SkeletonBlock className="h-6 w-6 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <View className="flex-1">
              <SkeletonBlock className="mb-2 h-[18px] w-[40%] rounded-[4px]" />
              <SkeletonBlock className="h-[14px] w-[30%] rounded-[4px]" />
            </View>
            <SkeletonBlock className="h-6 w-6 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <View className="flex-1">
              <SkeletonBlock className="mb-2 h-[18px] w-[40%] rounded-[4px]" />
              <SkeletonBlock className="h-[14px] w-[30%] rounded-[4px]" />
            </View>
            <SkeletonBlock className="h-6 w-6 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <View className="flex-1">
              <SkeletonBlock className="mb-2 h-[18px] w-[40%] rounded-[4px]" />
              <SkeletonBlock className="h-[14px] w-[30%] rounded-[4px]" />
            </View>
            <SkeletonBlock className="h-6 w-6 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <View className="flex-1">
              <SkeletonBlock className="mb-2 h-[18px] w-[40%] rounded-[4px]" />
              <SkeletonBlock className="h-[14px] w-[30%] rounded-[4px]" />
            </View>
            <SkeletonBlock className="h-6 w-6 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <View className="flex-1">
              <SkeletonBlock className="mb-2 h-[18px] w-[40%] rounded-[4px]" />
              <SkeletonBlock className="h-[14px] w-[30%] rounded-[4px]" />
            </View>
            <SkeletonBlock className="h-6 w-6 rounded-full" />
          </View>
        </View>
      </View>
    </ShimmerWrapper>
  )
}

export default ProgramDetailsShimmer
