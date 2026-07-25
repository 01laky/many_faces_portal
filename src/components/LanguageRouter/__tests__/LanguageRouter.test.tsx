// @vitest-environment happy-dom
/**
 * GPL-19 (global app preloader, portal): a cold refresh on a deep localized URL
 * (`/:lang/homepage`) must show the `AppBootstrapGate` preloader exactly once and
 * then hand over to the route tree — `LanguageRouter` runs *after* the gate and must
 * never introduce a second full-viewport loader.
 *
 * Pipeline position: `AppBootstrapGate` (auth session latch + faces config) wraps
 * `AppRoutes`, whose `/:lang` branch element is `LanguageRouter`. The gate deliberately
 * does not aggregate URL language sync, so `ensureLanguageLoaded` may still be in flight
 * while the routed page is already on screen.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppBootstrapGate } from '../../AppBootstrapGate';
import { LanguageRouter } from '../LanguageRouter';

const useAuthMock = vi.fn();
const useFaceConfigMock = vi.fn();
const ensureLanguageLoadedMock = vi.fn();
const changeLanguageMock = vi.fn();
let activeLanguage = 'en';

vi.mock('../../../contexts/AuthContext', () => ({
	useAuth: () => useAuthMock(),
}));

vi.mock('../../../contexts/FaceConfigContext', () => ({
	useFaceConfig: () => useFaceConfigMock(),
}));

vi.mock('../../../i18n/config', () => ({
	ensureLanguageLoaded: (lng: string) => ensureLanguageLoadedMock(lng),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, fallback?: string) => fallback ?? key,
		i18n: {
			get language() {
				return activeLanguage;
			},
			changeLanguage: (lng: string) => changeLanguageMock(lng),
		},
	}),
}));

/** Gate + `/:lang` branch exactly as `AppRoutes` wires them, with a stub page leaf. */
function bootstrapTree(initialPath: string) {
	return (
		<MemoryRouter initialEntries={[initialPath]}>
			<AppBootstrapGate>
				<Routes>
					<Route path="/:lang" element={<LanguageRouter />}>
						<Route path="homepage" element={<div data-testid="homepage-content">homepage</div>} />
					</Route>
				</Routes>
			</AppBootstrapGate>
		</MemoryRouter>
	);
}

/** Any full-viewport bootstrap loader currently mounted (gate preloader or legacy views). */
function fullScreenLoaderCount(): number {
	return (
		screen.queryAllByTestId('global-app-preloader').length +
		screen.queryAllByText(/Loading routes configuration/i).length +
		screen.queryAllByText(/^Loading\.\.\.$/).length
	);
}

describe('LanguageRouter GPL', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		activeLanguage = 'en';
		ensureLanguageLoadedMock.mockResolvedValue(undefined);
		changeLanguageMock.mockResolvedValue(undefined);
		useAuthMock.mockReturnValue({ isSessionHydrated: true });
	});

	it('GPL-19: refresh on /:lang/homepage shows one gate loader, then none after the gate opens', async () => {
		useFaceConfigMock.mockReturnValue({ isLoading: true, error: null, reload: vi.fn() });

		const { rerender } = render(bootstrapTree('/en/homepage'));
		await act(async () => {});

		// Bootstrap still blocking: exactly one full-viewport loader, page not mounted yet.
		expect(fullScreenLoaderCount()).toBe(1);
		expect(screen.getByTestId('global-app-preloader')).toBeTruthy();
		expect(screen.queryByTestId('homepage-content')).toBeNull();

		useFaceConfigMock.mockReturnValue({ isLoading: false, error: null, reload: vi.fn() });
		await act(async () => {
			rerender(bootstrapTree('/en/homepage'));
		});

		// Gate open: the deep-linked page renders and no second full-screen loader replaces it.
		expect(screen.getByTestId('homepage-content')).toBeTruthy();
		expect(fullScreenLoaderCount()).toBe(0);
		expect(screen.queryAllByRole('status')).toHaveLength(0);
	});

	it('GPL-19: the gate does not wait for the LanguageRouter URL language sync', async () => {
		// Language sync for a non-active bundle stays pending for the whole test.
		ensureLanguageLoadedMock.mockReturnValue(new Promise<void>(() => {}));
		useFaceConfigMock.mockReturnValue({ isLoading: false, error: null, reload: vi.fn() });

		render(bootstrapTree('/sk/homepage'));
		await act(async () => {});

		expect(ensureLanguageLoadedMock).toHaveBeenCalledWith('sk');
		expect(changeLanguageMock).not.toHaveBeenCalled();
		expect(screen.getByTestId('homepage-content')).toBeTruthy();
		expect(fullScreenLoaderCount()).toBe(0);
	});
});
