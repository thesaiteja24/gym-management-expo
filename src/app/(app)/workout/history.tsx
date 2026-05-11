import { useCallback, useEffect, useMemo, useState } from 'react'
import { DimensionValue, useColorScheme, View, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { SocialWorkoutCard } from '@/components/social/SocialWorkoutCard'
import BaseListScreen from '@/components/ui/BaseListScreen'
import { useExercises } from '@/hooks/queries/exercises'
import { useWorkoutHistoryQuery } from '@/hooks/queries/workouts'
import { ExerciseType } from '@/types/exercises'

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
  const shimmer = useSharedValue(0.4)

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(withTiming(0.85, { duration: 900 }), withTiming(0.4, { duration: 900 })),
      -1,
      true,
    )
  }, [shimmer])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }))

  const blockStyle: ViewStyle = {
    width,
    height,
    borderRadius: rounded,
    backgroundColor: scheme === 'dark' ? '#3F3F46' : '#E5E7EB',
  }

  return <Animated.View style={[animatedStyle, blockStyle]} />
}

/* ──────────────────────────────────────────────
   Workout Card Skeleton
────────────────────────────────────────────── */

function SkeletonSocialWorkoutCard() {
  return (
    <View className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <View className="mb-4 flex-row items-center gap-3">
        <SkeletonBlock width={44} height={44} rounded={999} />
        <View className="flex-1 flex-col gap-2">
          <SkeletonBlock width="70%" height={16} />
          <SkeletonBlock width="50%" height={16} />
        </View>
      </View>
      <View className="mb-4 gap-2">
        <SkeletonBlock width="60%" height={18} />
      </View>
      <View className="mb-4 flex-row justify-between gap-4">
        <SkeletonBlock width="45%" height={14} />
        <SkeletonBlock width="45%" height={14} />
      </View>
      {[0, 1, 2].map((i) => (
        <View key={i} className="mb-2 flex-row items-center gap-3">
          <SkeletonBlock width={44} height={44} rounded={999} />
          <SkeletonBlock width="70%" height={16} />
        </View>
      ))}
    </View>
  )
}

const History = () => {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    workoutHistory,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    refetch: refetchHistory,
  } = useWorkoutHistoryQuery()

  const { data: exerciseList = [] } = useExercises()

  const exerciseTypeMap = useMemo(() => {
    const map = new Map<string, ExerciseType>()
    exerciseList.forEach((ex) => map.set(ex.id, ex.exerciseType))
    return map
  }, [exerciseList])

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetchHistory()
    setIsRefreshing(false)
  }, [refetchHistory])

  const renderShimmer = () => (
    <View className="flex-1 px-4 pt-4">
      <View className="mt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonSocialWorkoutCard key={i} />
        ))}
      </View>
    </View>
  )

  return (
    <BaseListScreen
      title="Workout History"
      backButton
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      shimmer={renderShimmer()}
      data={workoutHistory}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <SocialWorkoutCard workout={item} exerciseTypeMap={exerciseTypeMap} index={index} />
      )}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onEndReached={fetchNextPage}
      emptyText="It's quiet empty out here 🤧"
      endReachedText="You've conquered all the workouts here 🏆"
      estimatedItemSize={150}
    />
  )
}

export default History
