import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useRef } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { StartProgramModal } from '@/components/modals/StartProgramModal'
import {
  WorkoutDetailsModal,
  WorkoutDetailsModalHandle,
} from '@/components/modals/WorkoutDetailsModal'
import { Button } from '@/components/ui'
import { BaseModal, BaseModalHandle } from '@/components/ui/BaseModal'
import BaseScreen from '@/components/ui/BaseScreen'
import { ProgramDetailsShimmer } from '@/components/ui/shimmers'
import { ROLES } from '@/constants/roles'
import { useProfileQuery } from '@/hooks/queries/me'
import {
  useActiveProgram,
  useDeleteProgram,
  useProgramById,
  useStartProgram,
} from '@/hooks/queries/programs'
import { Arise } from '@/lib/arise'
import { useAuth } from '@/stores/auth.store'
import { SelfUser } from '@/types/me'

export default function ProgramTemplateDetails() {
  const params = useLocalSearchParams()
  const { data: program, isLoading: programByIdLoading } = useProgramById(params.id as string)
  const { data: activeProgram } = useActiveProgram()
  const deleteProgramMutation = useDeleteProgram()
  const startProgramMutation = useStartProgram()

  const deleteModalRef = useRef<BaseModalHandle>(null)
  const workoutDetailsModalRef = useRef<WorkoutDetailsModalHandle>(null)
  const startProgramSheetRef = useRef<BaseModalHandle>(null)

  const handleConfirmStart = (duration: number) => {
    if (!program?.id) return

    startProgramMutation.mutate(
      {
        programId: program.id,
        duration: duration,
        startDate: new Date(),
      },
      {
        onSuccess: () => {
          startProgramSheetRef.current?.dismiss()
          Arise.success({
            heading: 'Program Started!',
            content: 'Redirecting to your workout dashboard...',
          })

          // Wait a bit for the animation and sync
          setTimeout(() => {
            router.push('/(app)/(tabs)/workout')
          }, 500)
        },
        onError: (error: any) => {
          Arise.error({
            heading: 'Failed to start program',
            content: error.message || 'Please try again',
          })
        },
      },
    )
  }

  const currentUserId = useAuth((s) => s.userId)
  const { data: userData } = useProfileQuery()
  const user = userData as SelfUser | null
  const userId = currentUserId
  const role = user?.role

  const renderHeaderRight = () => (
    <View className="flex-row items-center gap-2">
      {userId === program?.createdBy && role === ROLES.systemAdmin && (
        <>
          <Button
            variant="ghost"
            title=""
            onPress={() =>
              router.push({
                pathname: '/(app)/program',
                params: { mode: 'edit', id: program?.id },
              })
            }
            leftIcon={<Ionicons name="create-outline" size={24} color="#3b82f6" />}
            className="p-0"
          />
          <Button
            variant="ghost"
            title=""
            onPress={() => deleteModalRef.current?.present()}
            leftIcon={<Ionicons name="trash-outline" size={24} color="#ef4444" />}
            className="p-0"
          />
        </>
      )}
    </View>
  )

  const renderFooter = () => (
    <View className="absolute bottom-0 left-0 right-0 mb-2 p-6">
      <Button
        title="Start This Program"
        variant="primary"
        onPress={() => startProgramSheetRef.current?.present()}
        className="mx-auto w-2/3 rounded-full"
      />
    </View>
  )

  if (!program) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-neutral-500">Program template not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
      </View>
    )
  }

  return (
    <BaseScreen
      title="Program Preview"
      isLoading={programByIdLoading}
      shimmer={<ProgramDetailsShimmer />}
      backButton
      right={renderHeaderRight()}
      scroll
      footerComponent={renderFooter()}
    >
      <Text className="mb-2 text-3xl font-bold text-black dark:text-white">{program.title}</Text>
      {program.description ? (
        <Text className="mb-6 text-base text-neutral-600 dark:text-neutral-400">
          {program.description}
        </Text>
      ) : null}

      <Text className="mb-4 text-xl font-bold text-black dark:text-white">Full Schedule</Text>

      {program?.weeks?.map((week) => (
        <View key={week.id} className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-black dark:text-white">{week.name}</Text>
          <View className="gap-2">
            {week.days.map((day) => (
              <TouchableOpacity
                key={day.id}
                activeOpacity={0.7}
                onPress={() => workoutDetailsModalRef.current?.present(day)}
                className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <View>
                  <Text className="text-base font-medium text-black dark:text-white">
                    {day.name}
                  </Text>
                  {day.isRestDay ? (
                    <Text className="mt-1 text-sm text-emerald-500">Rest Day</Text>
                  ) : (
                    <Text className="mt-1 text-sm text-blue-500">
                      {day.template?.title || 'No Template Linked'}
                    </Text>
                  )}
                </View>
                {!day.isRestDay && <Ionicons name="barbell-outline" size={24} color="#9ca3af" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <BaseModal
        ref={deleteModalRef}
        title="Delete Program"
        description="Are you sure you want to delete this program? This will not affect users already following it."
        deleteAction={{
          title: 'Delete',
          onPress: () => {
            if (!program?.id) return

            deleteProgramMutation.mutate(program.id, {
              onSuccess: () => {
                Arise.success({ heading: 'Program deleted' })
                deleteModalRef.current?.dismiss()
                router.back()
              },
              onError: (error: any) => {
                Arise.error({
                  heading: 'Failed to delete program',
                  content: error.message || 'Please try again',
                })
              },
            })
          },
        }}
        cancelAction={{
          onPress: () => deleteModalRef.current?.dismiss(),
        }}
      />

      <WorkoutDetailsModal ref={workoutDetailsModalRef} />

      <StartProgramModal
        ref={startProgramSheetRef}
        program={program}
        activeProgram={activeProgram ?? null}
        onConfirm={handleConfirmStart}
        isLoading={startProgramMutation.isPending}
      />
    </BaseScreen>
  )
}
