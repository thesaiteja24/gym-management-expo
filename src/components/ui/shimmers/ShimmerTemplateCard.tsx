import { useEffect } from 'react'
import { type DimensionValue, useColorScheme, View, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

/* ──────────────────────────────────────────────
   Core Skeleton Block (fade-in + shimmer)
────────────────────────────────────────────── */

function SkeletonBlock({
  width = '100%',
  height = 14,
  rounded = 8,
}: {
  width?: DimensionValue
  height?: number
  rounded?: number
}) {
  const scheme = useColorScheme()

  const fade = useSharedValue(0)
  const shimmer = useSharedValue(0.4)

  useEffect(() => {
    // Soft entrance
    fade.value = withTiming(1, { duration: 250 })

    // Shimmer loop
    shimmer.value = withRepeat(
      withSequence(withTiming(0.85, { duration: 900 }), withTiming(0.4, { duration: 900 })),
      -1,
      true,
    )
  }, [fade, shimmer])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value * shimmer.value,
  }))

  const blockStyle: ViewStyle = {
    width,
    height,
    borderRadius: rounded,
    backgroundColor: scheme === 'dark' ? '#3F3F46' : '#E5E7EB', // neutral-700 / neutral-200
  }

  return <Animated.View style={[animatedStyle, blockStyle]} />
}

/* ──────────────────────────────────────────────
   Template Card Skeleton (matches TemplateCard layout)
────────────────────────────────────────────── */

export function ShimmerTemplateCard() {
  return (
    <View className="h-40 w-full gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <View className="mb-3 flex-col justify-between gap-2">
        <View className="flex-row items-center justify-between gap-4">
          <SkeletonBlock width="60%" height={20} rounded={6} />
        </View>
        <SkeletonBlock width="40%" height={14} rounded={4} />
      </View>

      {/* Button skeleton */}
      <SkeletonBlock width="100%" height={40} rounded={12} />
    </View>
  )
}
export default ShimmerTemplateCard
