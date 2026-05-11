import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

export function SkeletonBlock({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <View className={`bg-neutral-200 dark:bg-neutral-800 ${className}`}>
      {children}
    </View>
  )
}

export function ShimmerWrapper({
  children,
  className,
  entering,
}: {
  children: React.ReactNode
  className?: string
  entering?: any
}) {
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

  return (
    <Animated.View entering={entering} style={animatedStyle} className={className}>
      {children}
    </Animated.View>
  )
}
