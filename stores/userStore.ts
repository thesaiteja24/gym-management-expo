/**
 * userStore.ts
 *
 * Transient UI state ONLY — search results, suggested users, follow loading.
 * All server reads and mutations (getUserData, updateUserData, follow/unfollow, etc.)
 * are handled by TanStack Query hooks in hooks/queries/useUser.ts.
 */
import { type SearchedUser } from '@/types/user'
import { create } from 'zustand'

type UserState = {
	searchLoading: boolean
	suggestedLoading: boolean
	followLoading: Record<string, boolean>
	searchResult: SearchedUser[] | null
	suggestedUsers: SearchedUser[] | null

	setSearchLoading: (loading: boolean) => void
	setSearchResult: (result: SearchedUser[] | null) => void
	resetSearchedUser: () => void
	setFollowLoading: (targetUserId: string, loading: boolean) => void
	optimisticFollow: (targetUserId: string, isFollowing: boolean) => void
}

export const useUser = create<UserState>(set => ({
	searchLoading: false,
	suggestedLoading: false,
	followLoading: {},
	searchResult: null,
	suggestedUsers: null,

	setSearchLoading: loading => set({ searchLoading: loading }),

	setSearchResult: result => set({ searchResult: result }),

	resetSearchedUser: () => set({ searchResult: null }),

	setFollowLoading: (targetUserId, loading) =>
		set(state => ({
			followLoading: { ...state.followLoading, [targetUserId]: loading },
		})),

	optimisticFollow: (targetUserId, isFollowing) =>
		set(state => ({
			searchResult: state.searchResult?.map(u => (u.id === targetUserId ? { ...u, isFollowing } : u)),
			suggestedUsers: state.suggestedUsers?.map(u => (u.id === targetUserId ? { ...u, isFollowing } : u)),
		})),
}))
