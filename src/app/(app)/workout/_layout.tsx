import { router, Stack } from 'expo-router'

import { useThemeColor } from '@/hooks/theme'

export default function WorkoutLayout() {
  const colors = useThemeColor()

  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="start"
        options={
          {
            title: 'Log Your Pump',
            leftIcon: 'chevron-back-outline',
            onLeftPress: () => {
              router.back()
            },
            rightIcons: [
              {
                name: 'checkmark-done',
                onPress: () => {
                  // this will be injected from the screen
                },
              },
            ],
          } as any
        }
      />

      <Stack.Screen name="[id]" />

      <Stack.Screen name="history" />

      <Stack.Screen name="save" />
    </Stack>
  )
}
