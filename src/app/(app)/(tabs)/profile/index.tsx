import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { BackHandler, View } from 'react-native'

import { UserEditProfileModal } from '@/components/modals/UserEditProfileModal'
import { UserFitnessGoalsModal } from '@/components/modals/UserFitnessGoalsModal'
import { UserMeasurementsModal } from '@/components/modals/UserMeasurementsModal'
import { UserUnitPreferencesModal } from '@/components/modals/UserUnitPreferencesModal'
import { Button } from '@/components/ui'
import { BaseModalHandle } from '@/components/ui/BaseModal'
import BaseScreen from '@/components/ui/BaseScreen'
import { UserHeader } from '@/components/user/UserHeader'
import { UserThemeToggle } from '@/components/user/UserThemeToggle'
import { useProfileQuery } from '@/hooks/queries/me'
import { useThemeColor } from '@/hooks/theme'
import { useAuth } from '@/stores/auth.store'

type SettingsRow =
  | {
      type: 'item'
      key: string
      title: string
      icon: React.ReactNode
      onPress: () => void
      isDestructive?: boolean
    }
  | {
      type: 'custom'
      key: string
      render: React.ReactNode
    }

interface SettingsListProps {
  rows: SettingsRow[]
}

const Divider = memo(() => {
  return <View className="ml-14 h-[1px] bg-neutral-100 dark:bg-neutral-800" />
})

Divider.displayName = 'Divider'

const SettingsList = memo(({ rows }: SettingsListProps) => {
  return (
    <View className="overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {rows.map((row, index) => (
        <View key={row.key}>
          {row.type === 'item' ? (
            <Button
              title={row.title}
              variant="ghost"
              className="justify-start py-4"
              textClassName={
                row.isDestructive
                  ? 'text-base font-medium text-red-600 dark:text-red-500'
                  : 'text-base font-medium text-neutral-700 dark:text-neutral-300'
              }
              leftIcon={row.icon}
              onPress={row.onPress}
            />
          ) : (
            row.render
          )}

          {index !== rows.length - 1 && <Divider />}
        </View>
      ))}
    </View>
  )
})

SettingsList.displayName = 'SettingsList'

export default function ProfileScreen() {
  const router = useRouter()

  const logout = useAuth((s) => s.logout)

  const { data: user } = useProfileQuery()

  const theme = useThemeColor()

  const unitSheetRef = useRef<BaseModalHandle>(null)
  const editProfileSheetRef = useRef<BaseModalHandle>(null)
  const measurementsSheetRef = useRef<BaseModalHandle>(null)
  const fitnessGoalsSheetRef = useRef<BaseModalHandle>(null)

  const openEditProfile = useCallback(() => {
    editProfileSheetRef.current?.present()
  }, [])

  const openMeasurements = useCallback(() => {
    measurementsSheetRef.current?.present()
  }, [])

  const openFitnessGoals = useCallback(() => {
    fitnessGoalsSheetRef.current?.present()
  }, [])

  const openUnitPreferences = useCallback(() => {
    unitSheetRef.current?.present()
  }, [])

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  useEffect(() => {
    const onBackPress = () => {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.push('/(app)/(tabs)/home')
      }

      return true
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)

    return () => subscription.remove()
  }, [router])

  const rows = useMemo<SettingsRow[]>(
    () => [
      {
        type: 'item',
        key: 'account-details',
        title: 'Account Details',
        icon: <AntDesign name="user" size={20} color={theme.icon} />,
        onPress: openEditProfile,
      },
      {
        type: 'item',
        key: 'measurements',
        title: 'Measurements',
        icon: <MaterialCommunityIcons name="ruler" size={20} color={theme.icon} />,
        onPress: openMeasurements,
      },
      {
        type: 'item',
        key: 'fitness-goals',
        title: 'Fitness Goals',
        icon: <MaterialCommunityIcons name="bullseye-arrow" size={24} color={theme.icon} />,
        onPress: openFitnessGoals,
      },
      {
        type: 'item',
        key: 'unit-preferences',
        title: 'Unit Preferences',
        icon: <MaterialCommunityIcons name="tune-variant" size={24} color={theme.icon} />,
        onPress: openUnitPreferences,
      },
      {
        type: 'custom',
        key: 'theme-toggle',
        render: <UserThemeToggle />,
      },
      {
        type: 'item',
        key: 'logout',
        title: 'Logout',
        icon: <AntDesign name="logout" size={22} color={theme.danger} />,
        onPress: handleLogout,
        isDestructive: true,
      },
    ],
    [theme, handleLogout, openEditProfile, openFitnessGoals, openMeasurements, openUnitPreferences],
  )

  return (
    <BaseScreen title="Profile">
      <View className="flex-1 gap-6">
        <UserHeader user={user ?? null} />

        <SettingsList rows={rows} />
      </View>

      <UserUnitPreferencesModal ref={unitSheetRef} />
      <UserEditProfileModal ref={editProfileSheetRef} />
      <UserMeasurementsModal ref={measurementsSheetRef} />
      <UserFitnessGoalsModal ref={fitnessGoalsSheetRef} />
    </BaseScreen>
  )
}
