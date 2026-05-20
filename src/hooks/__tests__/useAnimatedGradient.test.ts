import { describe, it, expect } from 'vitest';
import { buildAnimatedGradientStyleVars } from '../useAnimatedGradient';

const animatedFaceJson = JSON.stringify({
  type: 'linear',
  colors: ['#6366f1', '#06b6d4'],
  angle: 118,
  animation: 'rotate',
  animationSpeed: 16,
});

describe('buildAnimatedGradientStyleVars', () => {
  it('omits animation CSS vars when animationEnabled is false', () => {
    const style = buildAnimatedGradientStyleVars(animatedFaceJson, false);
    expect(style).toHaveProperty('--gradient-bg');
    expect(style).not.toHaveProperty('--gradient-animation');
  });

  it('includes animation CSS vars when animationEnabled is true', () => {
    const style = buildAnimatedGradientStyleVars(animatedFaceJson, true);
    expect(style['--gradient-animation']).toContain('gradient-rotate');
  });
});
