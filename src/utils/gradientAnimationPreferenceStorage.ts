/** localStorage key for guest users (authenticated users use UserProfile.EnableAnimatedGradient). */
export const GRADIENT_ANIMATION_STORAGE_KEY = 'mfai.enableAnimatedGradient';

export function readGuestGradientAnimationEnabled(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(GRADIENT_ANIMATION_STORAGE_KEY) === '1';
}

export function writeGuestGradientAnimationEnabled(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(GRADIENT_ANIMATION_STORAGE_KEY, enabled ? '1' : '0');
}
