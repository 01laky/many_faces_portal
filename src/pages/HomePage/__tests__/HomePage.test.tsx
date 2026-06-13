// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { HomePage } from '../HomePage';

const useAuthMock = vi.fn();

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string, fallback?: string) => fallback ?? key }),
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => useAuthMock() }));
vi.mock('@/hooks/useLocalizedLink', () => ({ useLocalizedLink: () => (p: string) => p }));

function renderHome() {
	return render(
		<MemoryRouter>
			<HomePage />
		</MemoryRouter>
	);
}

describe('HomePage (guest landing)', () => {
	it('renders the i18n guest title and the login/register links', () => {
		useAuthMock.mockReturnValue({ user: null });
		renderHome();
		expect(screen.getByText('Welcome to Many Faces')).toBeTruthy();
		expect(screen.getByText('pages.login.title')).toBeTruthy();
		expect(screen.getByText('pages.register.title')).toBeTruthy();
	});

	it('does not render the leftover debug "Show All Toast Types" button (regression)', () => {
		useAuthMock.mockReturnValue({ user: null });
		renderHome();
		expect(screen.queryByText(/Show All Toast/i)).toBeNull();
		expect(screen.queryByText('hello fe')).toBeNull();
	});

	it('greets a signed-in user without a hardcoded English string', () => {
		useAuthMock.mockReturnValue({ user: { email: 'a@b.c', firstName: 'Ann', lastName: 'Lee' } });
		renderHome();
		expect(screen.getByText(/a@b\.c/)).toBeTruthy();
		expect(screen.getByText('Ann Lee')).toBeTruthy();
	});

	it('shows no welcome block for a guest', () => {
		useAuthMock.mockReturnValue({ user: null });
		renderHome();
		expect(screen.queryByText(/Welcome,/)).toBeNull();
	});
});
