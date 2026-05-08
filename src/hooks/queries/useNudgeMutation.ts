import { useMutation } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'

import { nudgeUserService } from '@/services/user.service'
import { useMeStore } from '@/stores/me.store'

export function useNudgeMutation() {
  const markUserAsNudged = useMeStore((state) => state.markUserAsNudged)

  return useMutation({
    mutationFn: ({ userId, note }: { userId: string; note?: string }) =>
      nudgeUserService(userId, note),
    onSuccess: (_, { userId }) => {
      markUserAsNudged(userId)
      Toast.show({
        type: 'success',
        text1: 'Nudge sent!',
        text2: 'They will receive a notification shortly.',
      })
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Nudge failed',
        text2: error.message || 'Something went wrong.',
      })
    },
  })
}
