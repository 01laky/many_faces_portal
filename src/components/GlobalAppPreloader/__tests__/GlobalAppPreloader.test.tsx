// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlobalAppPreloader } from '../GlobalAppPreloader';

vi.mock('react-loading-indicators', () => ({
	ThreeDot: () => <div data-testid="three-dot" />,
}));

describe('GlobalAppPreloader GPL', () => {
	it('GPL-4: renders MainLogo, brand title, and CSS dots in bootstrap mode', () => {
		render(<GlobalAppPreloader />);
		expect(screen.getByTestId('global-app-preloader')).toBeTruthy();
		expect(document.querySelector('.main-logo img')).toBeTruthy();
		expect(screen.getByText('Many Faces')).toBeTruthy();
		expect(document.querySelectorAll('.global-app-preloader__dot')).toHaveLength(3);
	});

	it('GPL-4b: route fallback still uses ThreeDot', () => {
		render(<GlobalAppPreloader variant="route-fallback" />);
		expect(screen.getByTestId('three-dot')).toBeTruthy();
	});

	it('GPL-20: keeps fixed spinner slot in the DOM for layout stability', () => {
		render(<GlobalAppPreloader />);
		expect(document.querySelector('.global-app-preloader__spinner')).toBeTruthy();
		expect(document.querySelector('.global-app-preloader--bootstrap')).toBeTruthy();
	});
});
