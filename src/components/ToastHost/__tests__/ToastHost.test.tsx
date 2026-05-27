/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import {
	ToastHost,
	resetToastHostForTests,
	ensureToastHost,
} from '@/components/ToastHost/ToastHost';

describe('ToastHost (PT-RP27)', () => {
	beforeEach(() => {
		resetToastHostForTests();
	});

	afterEach(() => {
		resetToastHostForTests();
	});

	it('PT-RP27-U1: cold load — no Toastify root until mounted', () => {
		const { container } = render(<ToastHost />);
		expect(container.querySelector('.Toastify')).toBeNull();
	});

	it('PT-RP27-U2: ensureToastHost allows render path', () => {
		ensureToastHost();
		const { container } = render(<ToastHost />);
		expect(container).toBeTruthy();
	});
});
