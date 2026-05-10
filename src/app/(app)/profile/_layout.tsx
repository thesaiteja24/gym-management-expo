import { Stack } from 'expo-router'

import { useThemeColor } from '@/hooks/theme'

export default function ProfileLayout() {
  const colors = useThemeColor()

  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      {/* User Profile */}
      <Stack.Screen name="[id]" />

      {/* Following */}
      <Stack.Screen name="following" />

      {/* Followers */}
      <Stack.Screen name="followers" />

      {/* Search */}
      <Stack.Screen name="search" />
    </Stack>
  )
}
