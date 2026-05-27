import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileApi from '@/api/profile/profileApi';
import { useAuth } from '@/contexts/AuthContext';
import { useFaceConfig } from '@/contexts/FaceConfigContext';
import type { UpdateProfileData } from './types';

/**
 * Stable React Query key for profile reads/writes. Includes `faceId` when the viewer is scoped to a face
 * so face-specific avatars invalidate independently of the global profile cache.
 */
export function profileQueryKey(
	faceId?: number | null
): readonly ['profile'] | readonly ['profile', number] {
	return faceId != null ? (['profile', faceId] as const) : (['profile'] as const);
}

export function faceGridSettingsQueryKey(
	faceId: number
): readonly ['profile', 'gridSettings', number] {
	return ['profile', 'gridSettings', faceId] as const;
}

/**
 * Profile + avatar hooks: reads `/profile` when authenticated, exposes mutations that invalidate the same
 * `profileQueryKey` family so the avatar strip updates after uploads.
 *
 * `resolvedAvatarUrl` prefers `faceAvatarUrl` (per-face override), then `globalAvatarUrl`, else `null`.
 */
/** Global profile read (no face scope) — shared cache for bootstrap consumers (PT-RP5). */
export function useGlobalProfile() {
	const { token, isAuthenticated } = useAuth();
	return useQuery({
		queryKey: profileQueryKey(),
		queryFn: () => profileApi.getProfile(token!),
		enabled: Boolean(isAuthenticated && token),
		gcTime: 15 * 60_000,
	});
}

export function useProfile() {
	const { token, isAuthenticated } = useAuth();
	const { selectedFace } = useFaceConfig();
	const queryClient = useQueryClient();
	const faceId = selectedFace?.id ?? null;

	const {
		data: profile,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: profileQueryKey(faceId),
		queryFn: () => profileApi.getProfile(token, faceId),
		enabled: Boolean(isAuthenticated && token),
		gcTime: 15 * 60_000,
	});

	const resolvedAvatarUrl = profile?.faceAvatarUrl ?? profile?.globalAvatarUrl ?? null;

	const updateMutation = useMutation({
		mutationFn: (data: UpdateProfileData) => profileApi.updateProfile(token, data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: profileQueryKey(faceId) }),
	});

	const uploadGlobalMutation = useMutation({
		mutationFn: (file: File) => profileApi.uploadGlobalAvatar(token, file),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: profileQueryKey() });
			void queryClient.invalidateQueries({ queryKey: profileQueryKey(faceId) });
		},
	});

	const uploadFaceMutation = useMutation({
		mutationFn: ({ faceId: fId, file }: { faceId: number; file: File }) =>
			profileApi.uploadFaceAvatar(token, fId, file),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: profileQueryKey(faceId) }),
	});

	return {
		profile: profile ?? null,
		isLoading,
		error,
		refetch,
		resolvedAvatarUrl,
		updateProfile: updateMutation.mutateAsync,
		updateProfileLoading: updateMutation.isPending,
		uploadGlobalAvatar: uploadGlobalMutation.mutateAsync,
		uploadGlobalLoading: uploadGlobalMutation.isPending,
		uploadFaceAvatar: (file: File) =>
			faceId != null
				? uploadFaceMutation.mutateAsync({ faceId, file })
				: Promise.reject(new Error('No face')),
		uploadFaceLoading: uploadFaceMutation.isPending,
	};
}
