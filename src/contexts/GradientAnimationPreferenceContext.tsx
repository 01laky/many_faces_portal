import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useFaceConfig } from './FaceConfigContext';
import { profileQueryKey, useProfile } from '../hooks/api/useProfileApi';
import type { ProfileMe } from '../api/profile/profileApi';
import {
	readGuestGradientAnimationEnabled,
	writeGuestGradientAnimationEnabled,
} from '../utils/gradientAnimationPreferenceStorage';

export interface GradientAnimationPreferenceContextValue {
	/** Effective flag after reduced-motion override. */
	animationEnabled: boolean;
	/** Raw user preference before reduced-motion override. */
	userWantsAnimation: boolean;
	prefersReducedMotion: boolean;
	setAnimationEnabled: (enabled: boolean) => Promise<void>;
	isUpdating: boolean;
}

const GradientAnimationPreferenceContext = createContext<
	GradientAnimationPreferenceContextValue | undefined
>(undefined);

function readPrefersReducedMotion(): boolean {
	if (typeof window === 'undefined' || !window.matchMedia) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function GradientAnimationPreferenceProvider({ children }: { children: ReactNode }) {
	const { t } = useTranslation('common');
	const { isAuthenticated, token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const queryClient = useQueryClient();
	const faceId = selectedFace?.id ?? null;
	const { profile, updateProfile, updateProfileLoading } = useProfile();
	const [guestEnabled, setGuestEnabled] = useState(() => readGuestGradientAnimationEnabled());
	/** Optimistic UI while PUT is in flight (checkbox must not wait on slow profile refetch). */
	const [pendingAuthGradient, setPendingAuthGradient] = useState<boolean | null>(null);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(readPrefersReducedMotion);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const onChange = () => setPrefersReducedMotion(mq.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	}, []);

	const userWantsAnimation = isAuthenticated
		? (pendingAuthGradient ?? profile?.enableAnimatedGradient ?? false)
		: guestEnabled;

	const animationEnabled = !prefersReducedMotion && userWantsAnimation;

	const setAnimationEnabled = useCallback(
		async (enabled: boolean) => {
			if (prefersReducedMotion) return;
			if (isAuthenticated) {
				if (!token) {
					toast.error(
						t('settingsPanel.animatedGradientSaveFailed', 'Could not save animation preference.')
					);
					return;
				}
				const profileKey = profileQueryKey(faceId);
				const previous = queryClient.getQueryData<ProfileMe>(profileKey);
				setPendingAuthGradient(enabled);
				if (previous) {
					queryClient.setQueryData<ProfileMe>(profileKey, {
						...previous,
						enableAnimatedGradient: enabled,
					});
				}
				try {
					await updateProfile({ enableAnimatedGradient: enabled });
					setPendingAuthGradient(null);
				} catch (err) {
					setPendingAuthGradient(null);
					if (previous) {
						queryClient.setQueryData(profileKey, previous);
					}
					const detail = err instanceof Error ? err.message : '';
					toast.error(
						detail ||
							t(
								'settingsPanel.animatedGradientSaveFailed',
								'Could not save animation preference. Please try again.'
							)
					);
				}
				return;
			}
			writeGuestGradientAnimationEnabled(enabled);
			setGuestEnabled(enabled);
		},
		[isAuthenticated, token, prefersReducedMotion, updateProfile, queryClient, faceId, t]
	);

	const value = useMemo(
		() => ({
			animationEnabled,
			userWantsAnimation,
			prefersReducedMotion,
			setAnimationEnabled,
			isUpdating: updateProfileLoading,
		}),
		[
			animationEnabled,
			userWantsAnimation,
			prefersReducedMotion,
			setAnimationEnabled,
			updateProfileLoading,
		]
	);

	return (
		<GradientAnimationPreferenceContext.Provider value={value}>
			{children}
		</GradientAnimationPreferenceContext.Provider>
	);
}

export function useGradientAnimationPreference(): GradientAnimationPreferenceContextValue {
	const ctx = useContext(GradientAnimationPreferenceContext);
	if (!ctx) {
		throw new Error(
			'useGradientAnimationPreference must be used within GradientAnimationPreferenceProvider'
		);
	}
	return ctx;
}
