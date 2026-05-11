import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { formatDistanceToNow } from 'date-fns'
import * as Crypto from 'expo-crypto'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo, useRef } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui'
import { BaseModal, BaseModalHandle } from '@/components/ui/BaseModal'
import BaseScreen from '@/components/ui/BaseScreen'
import { ShimmerWorkoutScreen } from '@/components/ui/shimmers/ShimmerWorkoutScreen'
import { UserVerifiedBadge } from '@/components/user/UserVerifiedBadge'
import { WorkoutReadOnlyExerciseRow } from '@/components/workout/WorkoutReadOnlyExerciseRow'
import { useExercises } from '@/hooks/queries/exercises'
import {
  useDeleteWorkoutMutation,
  useWorkoutByIdQuery,
  useWorkoutHistoryQuery,
  useWorkoutListQuery,
} from '@/hooks/queries/workouts'
import { useThemeColor } from '@/hooks/theme'
import { useShare } from '@/hooks/useShare'
import { Arise } from '@/lib/arise'
import { useAuth } from '@/stores/auth.store'
import { useWorkoutEditor } from '@/stores/workout-editor.store'
import { ExerciseType } from '@/types/exercises'
import { WorkoutHistoryExercise, WorkoutHistorySet, WorkoutLogGroup } from '@/types/workouts'
import { calculateWorkoutMetrics, formatDurationFromDates } from '@/utils/workout'

/* ───────────────── Component ───────────────── */

export default function WorkoutDetails() {
  /* Local State */
  const { id } = useLocalSearchParams<{ id: string }>()
  const isDark = useThemeColor().isDark
  const { shareEntity } = useShare()

  const deleteModalRef = useRef<BaseModalHandle>(null)
  const discardModalRef = useRef<BaseModalHandle>(null)

  /* Store Related State */
  const { data: exerciseList = [] } = useExercises()
  const currentUserId = useAuth((state) => state.userId)

  const deleteMutation = useDeleteWorkoutMutation()

  const { workouts, isLoading: isDiscoverLoading } = useWorkoutListQuery()
  const { workoutHistory, isLoading: isHistoryLoading } = useWorkoutHistoryQuery()

  /* Derived State */
  const exerciseTypeMap = useMemo(() => {
    const map = new Map<string, ExerciseType>()
    exerciseList.forEach((ex) => {
      map.set(ex.id, ex.exerciseType)
    })
    return map
  }, [exerciseList])

  const workoutFromStore = null // no longer stored in Zustand
  const workoutFromHistory = useMemo(() => {
    return workoutHistory.find((w) => w.id === id)
  }, [workoutHistory, id])
  const workoutFromDiscover = useMemo(() => {
    return workouts.find((w) => w.id === id)
  }, [workouts, id])

  const hasLocalData = !!(workoutFromStore || workoutFromHistory || workoutFromDiscover)

  const { data: workoutFromNetwork, isLoading: isByIdLoading } = useWorkoutByIdQuery(id!, {
    enabled: !hasLocalData && !!id,
  })

  const workout =
    workoutFromStore ?? workoutFromHistory ?? workoutFromDiscover ?? workoutFromNetwork
  const isLoading = !workout && (isDiscoverLoading || isHistoryLoading || isByIdLoading)

  const isAuthrized = currentUserId === workout?.user?.id

  const groupMap = useMemo(() => {
    const map = new Map<string, WorkoutLogGroup>()
    workout?.exerciseGroups?.forEach((g: WorkoutLogGroup) => map.set(g.id, g))
    return map
  }, [workout?.exerciseGroups])

  const handleEdit = useCallback(() => {
    if (!workout) return

    const {
      workout: activeWorkout,
      mode: activeMode,
      source,
      initiateWorkout,
    } = useWorkoutEditor.getState()

    if (activeWorkout) {
      if (activeMode === 'edit-history' && source?.workoutHistoryId === workout.id) {
        // Resuming same edit
        router.push('/(app)/workout/start')
        return
      }
      // Warn about overwriting
      discardModalRef.current?.present()
    } else {
      initiateWorkout({ mode: 'edit-history', historyItem: workout })
      router.push('/(app)/workout/start')
    }
  }, [workout, discardModalRef])

  const handleDiscardConfirm = () => {
    if (!workout) return
    useWorkoutEditor.getState().discardWorkout()
    useWorkoutEditor.getState().initiateWorkout({ mode: 'edit-history', historyItem: workout })
    // Modal auto dismisses on confirm
    router.push('/(app)/workout/start')
  }

  const handleDeleteConfirm = async () => {
    if (!workout) return
    router.back()
    deleteMutation.mutate(workout.id, {
      onSuccess: () => Arise.success({ heading: 'Workout deleted' }),
      onError: () => Arise.error({ heading: 'Failed to delete workout' }),
    })
  }

  const handleSaveAsTemplate = () => {
    if (!workout) return

    // 1. Create ID Mappings for Groups
    // We Map <OldDBGroupId, NewDraftGroupUUID>
    const groupIdMap = new Map<string, string>()
    workout.exerciseGroups.forEach((g: WorkoutLogGroup) => {
      groupIdMap.set(g.id, Crypto.randomUUID())
    })

    // 2. Clone Groups with New IDs
    const exerciseGroups = workout.exerciseGroups.map((g: WorkoutLogGroup, gIdx: number) => ({
      id: groupIdMap.get(g.id)!, // Use the mapped new UUID
      groupIndex: gIdx,
      groupType: g.groupType,
      restSeconds: g.restSeconds ?? undefined,
    }))

    // 3. Clone Exercises & Sets with New IDs
    const exercises = workout.exercises.map((ex: WorkoutHistoryExercise, exIdx: number) => {
      // Resolve new Group ID if applicable
      const newGroupId = ex.exerciseGroupId ? groupIdMap.get(ex.exerciseGroupId) : undefined

      return {
        id: Crypto.randomUUID(), // New Draft Item UUID
        exerciseId: ex.exercise.id,
        exerciseIndex: exIdx,
        exerciseGroupId: newGroupId,
        sets: ex.sets.map((s: WorkoutHistorySet, sIdx: number) => ({
          id: Crypto.randomUUID(), // New Set UUID
          setIndex: sIdx,
          setType: s.setType,
          weight: s.weight ?? undefined,
          reps: s.reps ?? undefined,
          note: s.note ?? undefined,
          rpe: s.rpe ?? undefined,
          durationSeconds: s.durationSeconds ?? undefined,
          restSeconds: s.restSeconds ?? undefined,
        })),
      }
    })

    useWorkoutEditor.getState().discardWorkout()
    useWorkoutEditor.getState().initiateWorkout({
      mode: 'template-create',
      template: {
        clientId: Crypto.randomUUID(),
        userId: '',
        title: workout.title || 'Untitled Workout',
        notes: 'Created from workout history',
        exercises,
        exerciseGroups,
      },
    })

    router.push('/(app)/template/editor')
  }

  const handleShare = useCallback(async () => {
    if (!workout || !workout.shareId) {
      Arise.error({
        heading: 'Error',
        content: 'Workout cannot be shared',
      })
      return
    }

    await shareEntity('workout', workout.shareId, {
      title: workout.title || 'Workout',
      image: workout.user?.profilePicUrl,
      message: `Check out ${workout.user?.firstName}'s workout on Pump!`,
    })
  }, [workout, shareEntity])

  if (!isLoading && !workout) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-lg text-neutral-500">Workout not found</Text>
      </View>
    )
  }

  const duration = workout ? formatDurationFromDates(workout.startTime, workout.endTime) : '0:00'

  const timeAgo = workout ? formatDistanceToNow(new Date(workout.endTime), { addSuffix: true }) : ''

  const { tonnage, completedSets } = workout
    ? calculateWorkoutMetrics(workout, exerciseTypeMap)
    : { tonnage: 0, completedSets: 0 }

  /* UI Components */
  const renderHeaderRight = () => (
    <View className="flex-row items-center gap-1">
      <Button
        variant="ghost"
        title=""
        onPress={handleShare}
        leftIcon={<Ionicons name="share-outline" size={24} color={isDark ? 'white' : 'black'} />}
        className="p-0"
      />
      {isAuthrized && (
        <Button
          variant="ghost"
          title=""
          onPress={handleEdit}
          leftIcon={<Ionicons name="create-outline" size={24} color={isDark ? 'white' : 'black'} />}
          className="p-0"
        />
      )}
    </View>
  )

  const renderFooter = () => (
    <View className="absolute bottom-0 left-0 right-0 mb-2 bg-transparent p-4">
      <View className="flex-row items-center justify-center gap-4 px-4">
        {isAuthrized && (
          <Button
            title="Delete"
            className="w-1/3 rounded-full"
            variant="danger"
            onPress={() => deleteModalRef.current?.present()}
          />
        )}
        <Button
          variant="primary"
          title="Save as Template"
          className="w-2/3 rounded-full"
          onPress={handleSaveAsTemplate}
        />
      </View>
    </View>
  )

  /* UI Rendering */
  return (
    <BaseScreen
      title={workout?.title || 'Workout Details'}
      scroll
      backButton
      right={renderHeaderRight()}
      footerComponent={renderFooter()}
      isLoading={isLoading}
      shimmer={<ShimmerWorkoutScreen />}
    >
      {/* Header */}
      <View className="mb-6 flex-row items-start gap-4">
        <Image
          source={
            workout?.user?.profilePicUrl
              ? { uri: workout.user.profilePicUrl }
              : require('../../../assets/images/icon.png')
          }
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            borderColor: isDark ? 'white' : 'black',
            borderWidth: 0.25,
          }}
          contentFit="cover"
        />

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text
              numberOfLines={1}
              className="flex-shrink text-base font-medium text-black dark:text-white"
            >
              {workout?.user?.firstName} {workout?.user?.lastName}
            </Text>

            {workout?.user?.isPro && (
              <UserVerifiedBadge tier={workout.user.proSubscriptionType} size={20} />
            )}
          </View>

          <View className="flex-row items-center justify-between">
            <Text
              numberOfLines={1}
              className="flex-1 text-sm text-neutral-500 dark:text-neutral-400"
            >
              {timeAgo} · {duration} · {tonnage?.toLocaleString()} kg · {completedSets} sets
            </Text>

            {workout?.isEdited && (
              <View className="ml-3 rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
                <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Edited
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Exercises */}
      <FlashList
        data={workout?.exercises || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const groupDetails = item.exerciseGroupId ? groupMap.get(item.exerciseGroupId) : null

          return <WorkoutReadOnlyExerciseRow key={item.id} exercise={item} group={groupDetails} />
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View className="mb-[100%]" />}
      />

      <BaseModal
        ref={deleteModalRef}
        title="Delete Workout?"
        description="This workout and all its data will be permanently deleted. This action cannot be undone."
        deleteAction={{
          title: 'Delete',
          onPress: handleDeleteConfirm,
        }}
        cancelAction={{
          onPress: () => deleteModalRef.current?.dismiss(),
        }}
      />

      <BaseModal
        ref={discardModalRef}
        title="Discard Current Workout?"
        description="You have an active workout in progress. Editing this history item will discard your current progress."
        deleteAction={{
          title: 'Discard & Edit',
          onPress: handleDiscardConfirm,
        }}
        cancelAction={{
          onPress: () => discardModalRef.current?.dismiss(),
        }}
      />
    </BaseScreen>
  )
}
