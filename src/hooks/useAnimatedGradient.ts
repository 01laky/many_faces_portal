import { useMemo } from 'react';
import type { CSSProperties } from 'react';

export interface GradientSettings {
  type: 'linear' | 'radial';
  colors: string[];
  angle: number;
  animation: 'none' | 'rotate' | 'shift' | 'pulse';
  animationSpeed: number;
}

export function parseGradientSettings(raw?: string | null): GradientSettings | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (!Array.isArray(p.colors) || p.colors.length < 2) return null;
    return {
      type: p.type === 'radial' ? 'radial' : 'linear',
      colors: p.colors,
      angle: typeof p.angle === 'number' ? p.angle : 135,
      animation: ['rotate', 'shift', 'pulse'].includes(p.animation) ? p.animation : 'none',
      animationSpeed: typeof p.animationSpeed === 'number' ? p.animationSpeed : 3,
    };
  } catch {
    return null;
  }
}

function buildGradientCSS(s: GradientSettings): string {
  // Double colors for smooth scrolling animation
  const colors =
    s.animation !== 'none' ? [...s.colors, ...s.colors].join(', ') : s.colors.join(', ');
  if (s.type === 'radial') {
    return `radial-gradient(circle, ${colors})`;
  }
  return `linear-gradient(${s.angle}deg, ${colors})`;
}

/** Pure builder — Vitest and {@link useAnimatedGradientStyle} share this logic. */
export function buildAnimatedGradientStyleVars(
  raw?: string | null,
  animationEnabled = false
): CSSProperties {
  const parsed = parseGradientSettings(raw);
  if (!parsed) return {};

  const settings: GradientSettings = animationEnabled ? parsed : { ...parsed, animation: 'none' };

  const vars: Record<string, string> = {
    '--gradient-bg': buildGradientCSS(settings),
  };

  if (settings.animation !== 'none') {
    vars['--gradient-size'] = '200% 200%';
    const name =
      settings.animation === 'rotate'
        ? 'gradient-rotate'
        : settings.animation === 'shift'
          ? 'gradient-shift'
          : 'gradient-pulse';
    const timing =
      settings.animation === 'pulse'
        ? 'ease-in-out'
        : settings.animation === 'shift'
          ? 'ease'
          : 'linear';
    vars['--gradient-animation'] = `${name} ${settings.animationSpeed}s ${timing} infinite`;
  }

  return vars as unknown as CSSProperties;
}

/**
 * Returns CSS custom properties for animated gradient background.
 * Use with ::before overlay technique for glassmorphism.
 * Pair with the gradient animation keyframes from AnimatedGradient.scss.
 *
 * @param animationEnabled User preference (default false) — when false, face animation JSON is ignored.
 */
export function useAnimatedGradientStyle(
  raw?: string | null,
  animationEnabled = false
): CSSProperties {
  return useMemo(
    () => buildAnimatedGradientStyleVars(raw, animationEnabled),
    [raw, animationEnabled]
  );
}
