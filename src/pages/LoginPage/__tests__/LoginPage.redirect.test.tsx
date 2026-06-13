// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { LoginPage } from '../LoginPage';

const useAuthMock = vi.fn();

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string, fallback?: string) => fallback ?? key }),
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => useAuthMock() }));
vi.mock('@/contexts/FaceConfigContext', () => ({
	useFaceConfig: () => ({
		getPostAuthHomePath: () => '/home',
		reload: vi.fn(),
		selectFace: vi.fn(),
	}),
}));
vi.mock('@/hooks/useLocalizedLink', () => ({ useLocalizedLink: () => (p: string) => p }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function renderLogin() {
	return render(
		<MemoryRouter initialEntries={['/login']}>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/home" element={<div>home target</div>} />
			</Routes>
		</MemoryRouter>
	);
}

describe('LoginPage authenticated redirect', () => {
	it('declaratively redirects an already-authenticated user (no imperative navigate in render)', () => {
		useAuthMock.mockReturnValue({ isAuthenticated: true, login: vi.fn() });
		renderLogin();
		expect(screen.getByText('home target')).toBeTruthy();
	});

	it('shows the login page (does not redirect) for a guest', () => {
		useAuthMock.mockReturnValue({ isAuthenticated: false, login: vi.fn() });
		renderLogin();
		expect(screen.queryByText('home target')).toBeNull();
	});
});
