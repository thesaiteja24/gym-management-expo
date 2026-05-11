import { Stack } from 'expo-router'


export default function ExerciseDetailsStack() {

  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}
