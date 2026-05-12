import { router, Stack } from 'expo-router'

export default function WorkoutLayout() {
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
