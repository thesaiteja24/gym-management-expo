import { View } from 'react-native'
import { FadeInDown } from 'react-native-reanimated'

import { ShimmerWrapper, SkeletonBlock } from './SkeletonBlock'

export function AnalyticsScreenShimmer() {
  return (
    <ShimmerWrapper entering={FadeInDown.duration(300).springify()} className="flex-1">
      <View className="gap-4">
        {/* MAIN CARD */}
        <View>
          <View className="w-full rounded-3xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            {/* title */}
            <SkeletonBlock className="h-[22px] w-[45%] rounded-[8px]" />

            <View className="mt-4 flex-row items-center justify-between">
              {/* chart circle */}
              <View className="flex-1 items-center justify-center">
                <SkeletonBlock className="h-[110px] w-[110px] rounded-full" />
              </View>

              {/* stats */}
              <View className="flex-1 gap-4">
                <View className="flex items-center">
                  <SkeletonBlock className="h-[22px] w-[40%] rounded-[8px]" />
                  <View className="mt-1" />
                  <SkeletonBlock className="h-[14px] w-[55%] rounded-[8px]" />
                </View>

                <View className="flex items-center">
                  <SkeletonBlock className="h-[22px] w-[35%] rounded-[8px]" />
                  <View className="mt-1" />
                  <SkeletonBlock className="h-[14px] w-[50%] rounded-[8px]" />
                </View>

                <View className="flex items-center">
                  <SkeletonBlock className="h-[22px] w-[38%] rounded-[8px]" />
                  <View className="mt-1" />
                  <SkeletonBlock className="h-[14px] w-[55%] rounded-[8px]" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* NUTRITION CARD */}
        <View>
          <View className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <View className="flex-row items-center justify-between">
              <SkeletonBlock className="h-[22px] w-[45%] rounded-[8px]" />
              <View className="flex-row gap-2">
                <SkeletonBlock className="h-[26px] w-[70px] rounded-[13px]" />
                <SkeletonBlock className="h-[26px] w-[70px] rounded-[13px]" />
              </View>
            </View>

            <View className="mt-6 flex-row justify-between">
              <View className="flex-1 items-center gap-2">
                <SkeletonBlock className="h-[70px] w-[70px] rounded-full" />
                <SkeletonBlock className="h-[14px] w-[60%] rounded-[8px]" />
              </View>

              <View className="flex-1 items-center gap-2">
                <SkeletonBlock className="h-[70px] w-[70px] rounded-full" />
                <SkeletonBlock className="h-[14px] w-[60%] rounded-[8px]" />
              </View>

              <View className="flex-1 items-center gap-2">
                <SkeletonBlock className="h-[70px] w-[70px] rounded-full" />
                <SkeletonBlock className="h-[14px] w-[60%] rounded-[8px]" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </ShimmerWrapper>
  )
}

export default AnalyticsScreenShimmer
