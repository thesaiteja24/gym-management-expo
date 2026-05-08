import { Redirect, useLocalSearchParams } from 'expo-router'

/**
 * reliable deep linking redirector.
 * This file exists solely to match the clean URL `pump.thesaiteja.dev/share/profile/:userId`
 * and redirect it to the internal functional route `(app)/profile/:userId`
 * where AuthGuard and other logic reside.
 */
export default function ShareRedirect() {
  const { userId } = useLocalSearchParams<{ userId: string }>()

  // Use replace to avoid keeping this redirect in the history stack
  return <Redirect href={`/(app)/profile/${userId}`} />
}
