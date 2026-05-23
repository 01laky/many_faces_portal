/** sessionStorage key for guest users (authenticated users use UserProfile.EnableAnimatedGradient). */
export const GRADIENT_ANIMATION_STORAGE_KEY = 'mfai.enableAnimatedGradient';

export type WebStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readGuestGradientAnimationEnabled(session?: WebStorageLike): boolean {
  const store = session ?? (typeof sessionStorage !== 'undefined' ? sessionStorage : undefined);
  if (!store) return false;
  return store.getItem(GRADIENT_ANIMATION_STORAGE_KEY) === '1';
}

export function writeGuestGradientAnimationEnabled(
  enabled: boolean,
  session?: WebStorageLike
): void {
  const store = session ?? (typeof sessionStorage !== 'undefined' ? sessionStorage : undefined);
  if (!store) return;
  store.setItem(GRADIENT_ANIMATION_STORAGE_KEY, enabled ? '1' : '0');
}
