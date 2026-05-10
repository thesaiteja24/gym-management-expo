import { Stack } from 'expo-router'

export default function ProfileLayout() {
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
