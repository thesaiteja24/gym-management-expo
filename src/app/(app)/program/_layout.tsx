import { Stack } from 'expo-router'
import React from 'react'

export default function ProgramLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    />
  )
}
