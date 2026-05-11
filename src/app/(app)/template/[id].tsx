import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo, useRef } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui'
import { BaseModal, BaseModalHandle } from '@/components/ui/BaseModal'
import BaseScreen from '@/components/ui/BaseScreen'
import { ShimmerTemplateScreen } from '@/components/ui/shimmers/ShimmerTemplateScreen'
import { WorkoutReadOnlyExerciseRow } from '@/components/workout/WorkoutReadOnlyExerciseRow'
import { useDeleteTemplateMutation, useTemplateByIdQuery } from '@/hooks/queries/templates'
import { useThemeColor } from '@/hooks/theme'
import { useShare } from '@/hooks/useShare'
import { Arise } from '@/lib/arise'
import { useWorkoutEditor } from '@/stores/workout-editor.store'
import { TemplateExerciseGroup } from '@/types/templates'

export default function TemplateDetails() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { shareEntity } = useShare()
  const isDark = useThemeColor().isDark

  // Fetch template directly from TQ cache / server
  const { data: template, isLoading } = useTemplateByIdQuery(id)

  const deleteMutation = useDeleteTemplateMutation()
  const initiateWorkout = useWorkoutEditor((state) => state.initiateWorkout)
  const discardWorkout = useWorkoutEditor((state) => state.discardWorkout)
  const handleEdit = useCallback(() => {
    router.push(`/(app)/template/editor?id=${id}`)
  }, [id])

  const handleShare = useCallback(async () => {
    if (!template?.shareId) {
      Arise.error({
        heading: 'Error',
        content: 'Template has no share link',
      })
      return
    }

    await shareEntity('template', template.shareId, {
      title: template.title || 'Workout Template',
      message: `Check out this workout template: ${template.title}`,
    })
  }, [template, shareEntity])

  const deleteModalRef = useRef<BaseModalHandle>(null)

  const groupMap = useMemo(() => {
    const map = new Map<string, TemplateExerciseGroup>()
    template?.exerciseGroups?.forEach((g) => map.set(g.id, g))
    return map
  }, [template?.exerciseGroups])

  if (!isLoading && !template) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-neutral-500">Template not found.</Text>
      </View>
    )
  }

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
      <Button
        variant="ghost"
        title=""
        onPress={handleEdit}
        leftIcon={<Ionicons name="create-outline" size={24} color={isDark ? 'white' : 'black'} />}
        className="p-0"
      />
    </View>
  )

  const renderFooter = () => (
    <View className="absolute bottom-0 left-0 right-0 p-6">
      <View className="flex-row items-center justify-center gap-4">
        <Button
          title="Delete"
          className="w-1/3 rounded-full"
          variant="danger"
          onPress={() => {
            deleteModalRef.current?.present()
          }}
        />
        <Button
          variant="success"
          title="Start Workout"
          className="w-2/3 rounded-full"
          onPress={() => {
            if (!template) return
            discardWorkout()
            initiateWorkout({ template })
            router.push('/(app)/workout/start')
          }}
        />
      </View>
    </View>
  )

  return (
    <BaseScreen
      title="Template Details"
      right={renderHeaderRight()}
      footerComponent={renderFooter()}
      backButton
      scroll
      contentContainerStyle={{ paddingBottom: 120 }}
      isLoading={isLoading}
      shimmer={<ShimmerTemplateScreen />}
    >
      {/* Header Info */}
      <View className="border-b border-neutral-100 pb-4 dark:border-neutral-900">
        <Text className="mb-2 text-3xl font-bold text-black dark:text-white">
          {template?.title}
        </Text>
        {template?.notes && (
          <Text className="mb-4 text-base text-neutral-600 dark:text-neutral-400">
            {template.notes}
          </Text>
        )}

        <View className="flex-row gap-4">
          <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
            <Text className="text-base font-medium text-neutral-500">
              {template?.exercises?.length || 0} Exercises
            </Text>
          </View>
          <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
            <Text className="text-base font-medium text-neutral-500">Last used: Never</Text>
          </View>
        </View>
      </View>

      {/* Read Only Exercise List */}
      <View className="gap-4 py-4">
        {template?.exercises?.map((ex, idx) => (
          <WorkoutReadOnlyExerciseRow
            key={ex.id || idx}
            exercise={ex}
            group={ex.exerciseGroupId ? groupMap.get(ex.exerciseGroupId) : null}
          />
        ))}
      </View>

      <BaseModal
        ref={deleteModalRef}
        title="Delete Template?"
        description="Are you sure you want to delete this template?"
        deleteAction={{
          title: 'Delete',
          onPress: () => {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                deleteModalRef.current?.dismiss()
                router.back()
              },
            })
          },
        }}
        cancelAction={{
          onPress: () => deleteModalRef.current?.dismiss(),
        }}
      />
    </BaseScreen>
  )
}
