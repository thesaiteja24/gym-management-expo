import { Stack } from 'expo-router'


export default function ExercisesLayout() {

  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      {/* EXERCISES LIST */}
      <Stack.Screen name="index" />

      {/* EXERCISE DETAIL */}
      <Stack.Screen name="[id]" />
    </Stack>
  )
}
