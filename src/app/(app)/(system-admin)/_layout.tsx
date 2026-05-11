import { Stack } from 'expo-router'
import React from 'react'

export default function SystemAdminLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    />
  )
}
