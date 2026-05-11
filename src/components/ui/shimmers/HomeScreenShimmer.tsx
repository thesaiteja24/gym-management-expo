import React from 'react'
import { ScrollView, useWindowDimensions, View } from 'react-native'
import { FadeInDown } from 'react-native-reanimated'

import { ShimmerWrapper, SkeletonBlock } from './SkeletonBlock'
import { UserStreakCardShimmer } from './UserStreakCardShimmer'

export function HomeScreenShimmer() {
  const { width } = useWindowDimensions()

  return (
    <ShimmerWrapper entering={FadeInDown.duration(300).springify()} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <UserStreakCardShimmer />

        {/* Habits */}
        <View className="mb-4">
          <SkeletonBlock className="h-7 w-[100px] rounded-[6px]" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          <View
            style={{ width: width * 0.5, height: width * 0.4 }}
            className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <SkeletonBlock className="h-[18px] w-[60%] rounded-[8px]" />
            <View className="mt-2">
              <SkeletonBlock className="h-[14px] w-[40%] rounded-[8px]" />
            </View>
            <View className="mt-auto">
              <SkeletonBlock className="h-[50px] w-full rounded-[12px]" />
            </View>
          </View>

          <View
            style={{ width: width * 0.5, height: width * 0.4 }}
            className="items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-transparent px-4 py-4 dark:border-neutral-700"
          >
            <SkeletonBlock className="h-[40px] w-[80%] rounded-[12px]" />
          </View>
        </ScrollView>

        {/* Metrics */}
        <View className="my-4">
          <SkeletonBlock className="h-7 w-[100px] rounded-[6px]" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          <View
            style={{ width: width * 0.5, height: width * 0.4 }}
            className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <SkeletonBlock className="h-[18px] w-[50%] rounded-[8px]" />
            <View className="mt-auto">
              <SkeletonBlock className="h-[60px] w-full rounded-[12px]" />
            </View>
          </View>

          <View
            style={{ width: width * 0.5, height: width * 0.4 }}
            className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <SkeletonBlock className="h-[18px] w-[60%] rounded-[8px]" />
            <View className="mt-4">
              <SkeletonBlock className="h-[24px] w-[80%] rounded-[8px]" />
            </View>
          </View>

          <View
            style={{ width: width * 0.5, height: width * 0.4 }}
            className="items-center justify-center rounded-2xl bg-transparent px-4 py-4"
          >
            <SkeletonBlock className="h-[40px] w-[60%] rounded-[12px]" />
          </View>
        </ScrollView>
      </ScrollView>
    </ShimmerWrapper>
  )
}

export default HomeScreenShimmer
