import { Stack } from 'expo-router'
import React from 'react'


export default function UserProgramLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  )
}
