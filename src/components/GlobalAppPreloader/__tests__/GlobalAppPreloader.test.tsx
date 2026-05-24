// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlobalAppPreloader } from '../GlobalAppPreloader';

vi.mock('react-loading-indicators', () => ({
  ThreeDot: () => <div data-testid="three-dot" />,
}));

describe('GlobalAppPreloader GPL', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce') ? false : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
  });

  it('GPL-4: renders MainLogo and ThreeDot', () => {
    render(<GlobalAppPreloader />);
    expect(screen.getByTestId('global-app-preloader')).toBeTruthy();
    expect(document.querySelector('.main-logo')).toBeTruthy();
    expect(screen.getByTestId('three-dot')).toBeTruthy();
  });

  it('GPL-20: omits spinner when reduced motion preferred', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
    render(<GlobalAppPreloader />);
    expect(screen.queryByTestId('three-dot')).toBeNull();
    expect(document.querySelector('.main-logo')).toBeTruthy();
  });
});
