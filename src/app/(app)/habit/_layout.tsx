import { Stack } from 'expo-router'

export default function HabitLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}
