// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { protectedRouteElement } from '../routeHelpers';

vi.mock('../../components/ProtectedRoute', () => ({
	ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="protected">{children}</div>
	),
}));

describe('routeHelpers REF-R', () => {
	it('REF-R1: protectedRouteElement wraps ProtectedRoute', () => {
		const el = protectedRouteElement(<span>page</span>);
		const { getByTestId, getByText } = render(el);
		expect(getByTestId('protected')).toBeTruthy();
		expect(getByText('page')).toBeTruthy();
	});

	it('REF-R2: guest routes unchanged — helper only wraps provided node', () => {
		const guest = protectedRouteElement(<div data-testid="guest">Guest page</div>);
		const { getByTestId } = render(guest);
		expect(getByTestId('guest')).toBeTruthy();
	});
});
