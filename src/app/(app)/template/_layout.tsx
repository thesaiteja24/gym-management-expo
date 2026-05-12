import { Stack } from 'expo-router'
import React from 'react'


export default function ExercisesLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen name="editor" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="share/[shareId]" />
    </Stack>
  )
}
