// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';

const useAuthMock = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
	useAuth: () => useAuthMock(),
}));

describe('ProtectedRoute GPL', () => {
	it('GPL-6: no loading UI when session already hydrated', () => {
		useAuthMock.mockReturnValue({ isAuthenticated: true, isLoading: true });
		render(
			<MemoryRouter initialEntries={['/en/home']}>
				<Routes>
					<Route
						path="/:lang/home"
						element={
							<ProtectedRoute>
								<div data-testid="protected-content">content</div>
							</ProtectedRoute>
						}
					/>
				</Routes>
			</MemoryRouter>
		);
		expect(screen.queryByText('Loading...')).toBeNull();
		expect(screen.getByTestId('protected-content')).toBeTruthy();
	});
});
