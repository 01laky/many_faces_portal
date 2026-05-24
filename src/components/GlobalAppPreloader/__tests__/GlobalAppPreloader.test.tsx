// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlobalAppPreloader } from '../GlobalAppPreloader';

vi.mock('react-loading-indicators', () => ({
  ThreeDot: () => <div data-testid="three-dot" />,
}));

describe('GlobalAppPreloader GPL', () => {
  it('GPL-4: renders MainLogo and ThreeDot', () => {
    render(<GlobalAppPreloader />);
    expect(screen.getByTestId('global-app-preloader')).toBeTruthy();
    expect(document.querySelector('.main-logo')).toBeTruthy();
    expect(screen.getByTestId('three-dot')).toBeTruthy();
  });

  it('GPL-20: keeps fixed spinner slot in the DOM for layout stability', () => {
    render(<GlobalAppPreloader />);
    expect(document.querySelector('.global-app-preloader__spinner')).toBeTruthy();
    expect(document.querySelector('.global-app-preloader--bootstrap')).toBeTruthy();
  });
});
