import { router, useLocalSearchParams } from 'expo-router'
import React, { useMemo } from 'react'
import { Alert, Text, View } from 'react-native'

import { Button } from '@/components/ui'
import BaseScreen from '@/components/ui/BaseScreen'
import { ShimmerTemplateScreen } from '@/components/ui/shimmers/ShimmerTemplateScreen'
import { WorkoutReadOnlyExerciseRow } from '@/components/workout/WorkoutReadOnlyExerciseRow'
import {
  useSaveSharedTemplateMutation,
  useTemplateByShareIdQuery,
  useTemplatesQuery,
} from '@/hooks/queries/templates'

export default function SharedTemplateDetails() {
  const { shareId } = useLocalSearchParams<{ shareId: string }>()

  const [loading, setLoading] = React.useState(false)

  // Templates from TQ cache (to detect if user already has the shared template)
  const { data: localTemplates = [] } = useTemplatesQuery()
  const saveSharedMutation = useSaveSharedTemplateMutation()

  // TanStack Query — fetch shared template by shareId
  const { data: sharedTemplate, isLoading } = useTemplateByShareIdQuery(shareId)

  const groupMap = useMemo(() => {
    const map = new Map<string, any>()
    sharedTemplate?.exerciseGroups?.forEach((g) => map.set(g.id, g))
    return map
  }, [sharedTemplate?.exerciseGroups])

  // Check if we already have this template
  const existingTemplate = useMemo(() => {
    if (!sharedTemplate?.shareId) return null
    return localTemplates.find((t) => t.sourceShareId === sharedTemplate.shareId)
  }, [localTemplates, sharedTemplate])

  const handleSave = async () => {
    if (!sharedTemplate) return
    setLoading(true)

    try {
      if (existingTemplate) {
        Alert.alert(
          'Overwrite Template?',
          'You already have a copy of this template. Do you want to overwrite your local version with this one?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setLoading(false),
            },
            {
              text: 'Overwrite',
              style: 'destructive',
              onPress: () => {
                saveSharedMutation.mutate(
                  { template: sharedTemplate, overwriteId: existingTemplate.id },
                  {
                    onSuccess: (res) => {
                      setLoading(false)
                      Alert.alert('Success', 'Template updated!', [
                        {
                          text: 'View Template',
                          onPress: () => router.replace(`/(app)/template/${existingTemplate.id}`),
                        },
                      ])
                    },
                    onError: () => {
                      setLoading(false)
                      Alert.alert('Error', 'Failed to save template.')
                    },
                  },
                )
              },
            },
            {
              text: 'Save as New',
              onPress: () => {
                saveSharedMutation.mutate(
                  { template: sharedTemplate },
                  {
                    onSuccess: (res) => {
                      setLoading(false)
                      Alert.alert('Success', 'Template saved as new copy!')
                      router.replace('/(app)/(tabs)/workout')
                    },
                    onError: () => {
                      setLoading(false)
                      Alert.alert('Error', 'Failed to save template.')
                    },
                  },
                )
              },
            },
          ],
        )
      } else {
        saveSharedMutation.mutate(
          { template: sharedTemplate },
          {
            onSuccess: () => {
              setLoading(false)
              Alert.alert('Success', 'Template saved to your library!')
              router.replace('/(app)/(tabs)/workout')
            },
            onError: () => {
              setLoading(false)
              Alert.alert('Error', 'Failed to save template.')
            },
          },
        )
      }
    } catch (e) {
      console.error(e)
      setLoading(false)
      Alert.alert('Error', 'Failed to save template.')
    }
  }

  /* UI Components */
  const renderFooter = () => (
    <View className="absolute bottom-0 left-0 right-0 mb-2 p-4">
      <Button
        title={existingTemplate ? 'Update Saved Template' : 'Save to My Templates'}
        onPress={handleSave}
        disabled={loading}
        className="rounded-full"
        variant="primary"
      />
    </View>
  )

  if (!isLoading && !sharedTemplate) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-neutral-500">Template not found.</Text>
      </View>
    )
  }

  return (
    <BaseScreen
      title="Shared Template"
      isLoading={isLoading}
      shimmer={<ShimmerTemplateScreen />}
      backButton
      onBackPress={() => router.replace('/(app)/(tabs)/workout')}
      scroll
      footerComponent={renderFooter()}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Header Info */}
      <View className="border-b border-neutral-100 pb-4 dark:border-neutral-900">
        <Text className="mb-2 text-3xl font-bold text-black dark:text-white">
          {sharedTemplate?.title}
        </Text>
        {/* Author Info */}
        <Text className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
          {sharedTemplate?.authorName
            ? `Created by ${sharedTemplate.authorName}`
            : 'Shared Template'}
        </Text>

        {sharedTemplate?.notes && (
          <Text className="mb-4 text-base text-neutral-600 dark:text-neutral-400">
            {sharedTemplate.notes}
          </Text>
        )}

        <View className="flex-row gap-4">
          <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
            <Text className="text-base font-medium text-neutral-500">
              {sharedTemplate?.exerciseGroups?.length || 0} Exercises
            </Text>
          </View>
        </View>
      </View>

      {/* Read Only Exercise List */}
      <View className="gap-4 py-4">
        {sharedTemplate?.exercises?.map((ex, idx) => (
          <WorkoutReadOnlyExerciseRow
            key={ex.id || idx}
            exercise={ex}
            group={ex.exerciseGroupId ? groupMap.get(ex.exerciseGroupId) : null}
          />
        ))}
      </View>
    </BaseScreen>
  )
}
