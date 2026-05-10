import { Stack } from 'expo-router'

export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* EXERCISES LIST */}
      <Stack.Screen name="index" />
    </Stack>
  )
}
