import {
	deleteProfilePicService,
	followUserService,
	getSuggestedUsersService,
	getUserDataService,
	getUserFollowersService,
	getUserFollowingService,
	searchUsersService,
	unFollowUserService,
	updateProfilePicService,
	updateUserDataService,
} from '@/services/userService'
import { type SearchedUser } from '@/types/user'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/stores/authStore'

// ─────────────────────────────────────────────────────
// READ — user profile
// ─────────────────────────────────────────────────────
export function useUserQuery(userId: string | undefined) {
	return useQuery({
		queryKey: ['user', 'profile', userId],
		queryFn: () => getUserDataService(userId!),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
	})
}

// ─────────────────────────────────────────────────────
// READ — search users
// ─────────────────────────────────────────────────────
export function useSearchUsersQuery(query: string) {
	return useQuery({
		queryKey: ['user', 'search', query],
		queryFn: () => searchUsersService(query),
		enabled: query.trim().length > 0,
		staleTime: 30 * 1000,
	})
}

// ─────────────────────────────────────────────────────
// READ — suggested users
// ─────────────────────────────────────────────────────
export function useSuggestedUsersQuery() {
	return useQuery({
		queryKey: ['user', 'suggested'],
		queryFn: getSuggestedUsersService,
		staleTime: 2 * 60 * 1000,
	})
}

// ─────────────────────────────────────────────────────
// READ — followers / following
// ─────────────────────────────────────────────────────
export function useUserFollowersQuery(userId: string | undefined) {
	return useQuery({
		queryKey: ['user', 'followers', userId],
		queryFn: () => getUserFollowersService(userId!),
		enabled: !!userId,
		staleTime: 60 * 1000,
	})
}

export function useUserFollowingQuery(userId: string | undefined) {
	return useQuery({
		queryKey: ['user', 'following', userId],
		queryFn: () => getUserFollowingService(userId!),
		enabled: !!userId,
		staleTime: 60 * 1000,
	})
}

// ─────────────────────────────────────────────────────
// MUTATION — update profile picture
// ─────────────────────────────────────────────────────
export function useUpdateProfilePicMutation() {
	const userId = useAuth.getState().user?.userId
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ uid, data }: { uid: string; data: FormData }) => updateProfilePicService(uid, data),
		onSuccess: res => {
			if (res.success) {
				useAuth.getState().setUser({
					...useAuth.getState().user,
					profilePicUrl: res.data.profilePicUrl,
					updatedAt: res.data.updatedAt,
				})
				qc.invalidateQueries({ queryKey: ['user', 'profile', userId] })
			}
		},
	})
}

// ─────────────────────────────────────────────────────
// MUTATION — delete profile picture
// ─────────────────────────────────────────────────────
export function useDeleteProfilePicMutation() {
	const userId = useAuth.getState().user?.userId
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (uid: string) => deleteProfilePicService(uid),
		onSuccess: res => {
			if (res.success) {
				useAuth.getState().setUser({
					...useAuth.getState().user,
					profilePicUrl: null,
					updatedAt: res.data?.updatedAt,
				})
				qc.invalidateQueries({ queryKey: ['user', 'profile', userId] })
			}
		},
	})
}

// ─────────────────────────────────────────────────────
// MUTATION — update user data
// ─────────────────────────────────────────────────────
export function useUpdateUserMutation() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: Record<string, any> }) =>
			updateUserDataService(userId, data),
		onMutate: ({ data }) => {
			// Optimistic update so the UI reflects change immediately
			useAuth.getState().setUser({
				...useAuth.getState().user,
				...data,
				updatedAt: new Date().toISOString(),
			})
		},
		onSuccess: (_res, { userId }) => {
			qc.invalidateQueries({ queryKey: ['user', 'profile', userId] })
		},
		onError: (_err, { data }) => {
			// rollback on failure
			const currentUser = useAuth.getState().user
			if (currentUser) {
				const rollback: Record<string, any> = {}
				Object.keys(data).forEach(k => {
					rollback[k] = (currentUser as any)[k]
				})
				useAuth.getState().setUser(rollback)
			}
		},
	})
}

// ─────────────────────────────────────────────────────
// MUTATION — update preferences
// ─────────────────────────────────────────────────────
export function useUpdatePreferencesMutation() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: Record<string, any> }) =>
			updateUserDataService(userId, data),
		onMutate: ({ data }) => {
			useAuth.getState().setUser({ ...useAuth.getState().user, ...data })
		},
		onSuccess: (_res, { userId }) => {
			qc.invalidateQueries({ queryKey: ['user', 'profile', userId] })
		},
	})
}

// ─────────────────────────────────────────────────────
// MUTATION — follow user (with optimistic update)
// ─────────────────────────────────────────────────────
export function useFollowUserMutation() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (targetUserId: string) => followUserService(targetUserId),
		onSuccess: (_res, targetUserId) => {
			qc.invalidateQueries({ queryKey: ['user', 'suggested'] })
			qc.invalidateQueries({ queryKey: ['user', 'followers'] })
		},
	})
}

// ─────────────────────────────────────────────────────
// MUTATION — unfollow user (with optimistic update)
// ─────────────────────────────────────────────────────
export function useUnfollowUserMutation() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (targetUserId: string) => unFollowUserService(targetUserId),
		onSuccess: (_res, targetUserId) => {
			qc.invalidateQueries({ queryKey: ['user', 'suggested'] })
			qc.invalidateQueries({ queryKey: ['user', 'following'] })
		},
	})
}
