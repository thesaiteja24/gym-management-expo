import { useMutation, useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/lib/queryKeys'
import { getUserByIdService } from '@/services/me.service'
import {
  getUserTopLiftsService,
  getUserTrainingAnalyticsService,
  nudgeUserService,
} from '@/services/user.service'
import { useMeStore } from '@/stores/me.store'

/**
 * Hook to fetch a public user's data
 * @param userId
 */
export function usePublicUserQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.user.byId(userId),
    queryFn: () => getUserByIdService(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to nudge a user
 */
export function useNudgeMutation() {
  const markUserAsNudged = useMeStore((state) => state.markUserAsNudged)

  return useMutation({
    mutationFn: ({ userId, note }: { userId: string; note?: string }) =>
      nudgeUserService(userId, note),
    onSuccess: (_, { userId }) => {
      markUserAsNudged(userId)
    },
  })
}

export function useUserTopLiftsQuery(userId: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.user.topLifts(userId),
    queryFn: () => getUserTopLiftsService(userId, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUserTrainingAnalyticsQuery(userId: string, duration: string = 'all') {
  return useQuery({
    queryKey: queryKeys.user.trainingAnalytics(userId, duration),
    queryFn: () => getUserTrainingAnalyticsService(userId, duration),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}
