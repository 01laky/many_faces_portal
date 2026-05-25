// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppBootstrapGate } from '../AppBootstrapGate';

const useAppBootstrapReadyMock = vi.fn();
const useFaceConfigMock = vi.fn();

vi.mock('../../../hooks/useAppBootstrapReady', () => ({
	useAppBootstrapReady: (...args: unknown[]) => useAppBootstrapReadyMock(...args),
}));

vi.mock('../../../contexts/FaceConfigContext', () => ({
	useFaceConfig: () => useFaceConfigMock(),
}));

vi.mock('../../GlobalAppPreloader/GlobalAppPreloader', () => ({
	GlobalAppPreloader: () => <div data-testid="global-app-preloader" />,
}));

describe('AppBootstrapGate GPL', () => {
	it('GPL-5: shows preloader then children', () => {
		useFaceConfigMock.mockReturnValue({ isLoading: true, error: null, reload: vi.fn() });
		useAppBootstrapReadyMock.mockReturnValue({
			isReady: false,
			error: null,
		});

		const { rerender } = render(
			<AppBootstrapGate>
				<div data-testid="app-ready">ready</div>
			</AppBootstrapGate>
		);
		expect(screen.getByTestId('global-app-preloader')).toBeTruthy();

		useAppBootstrapReadyMock.mockReturnValue({ isReady: true, error: null });
		rerender(
			<AppBootstrapGate>
				<div data-testid="app-ready">ready</div>
			</AppBootstrapGate>
		);
		expect(screen.getByTestId('app-ready')).toBeTruthy();
	});
});
