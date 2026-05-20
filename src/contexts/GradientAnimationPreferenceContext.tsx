import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from '../hooks/api/useProfileApi';
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
  const { isAuthenticated } = useAuth();
  const { profile, updateProfile, updateProfileLoading } = useProfile();
  const [guestEnabled, setGuestEnabled] = useState(() => readGuestGradientAnimationEnabled());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(readPrefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const userWantsAnimation = isAuthenticated
    ? (profile?.enableAnimatedGradient ?? false)
    : guestEnabled;

  const animationEnabled = !prefersReducedMotion && userWantsAnimation;

  const setAnimationEnabled = useCallback(
    async (enabled: boolean) => {
      if (prefersReducedMotion) return;
      if (isAuthenticated) {
        await updateProfile({ enableAnimatedGradient: enabled });
        return;
      }
      writeGuestGradientAnimationEnabled(enabled);
      setGuestEnabled(enabled);
    },
    [isAuthenticated, prefersReducedMotion, updateProfile]
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
