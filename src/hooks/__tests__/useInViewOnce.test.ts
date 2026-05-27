/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInViewOnce } from '@/hooks/useInViewOnce';

describe('useInViewOnce (PT-RP16)', () => {
	const originalIO = global.IntersectionObserver;

	beforeEach(() => {
		vi.stubGlobal(
			'IntersectionObserver',
			vi.fn(function IntersectionObserverMock(
				this: IntersectionObserver,
				cb: IntersectionObserverCallback
			) {
				this.observe = vi.fn((target: Element) => {
					cb([{ isIntersecting: true, target } as IntersectionObserverEntry], this);
				});
				this.disconnect = vi.fn();
				this.unobserve = vi.fn();
				this.takeRecords = vi.fn(() => []);
				this.root = null;
				this.rootMargin = '';
				this.thresholds = [];
			})
		);
	});

	afterEach(() => {
		if (originalIO) {
			vi.stubGlobal('IntersectionObserver', originalIO);
		} else {
			// @ts-expect-error cleanup
			delete global.IntersectionObserver;
		}
	});

	it('PT-RP16-U1: becomes inView after element observed', async () => {
		const { result } = renderHook(() => useInViewOnce());
		expect(result.current.inView).toBe(false);
		const node = document.createElement('div');
		act(() => {
			result.current.ref(node);
		});
		await waitFor(() => expect(result.current.inView).toBe(true));
	});

	it('PT-RP16-U2: without IntersectionObserver defaults to inView true', () => {
		// @ts-expect-error simulate missing API
		delete global.IntersectionObserver;
		const { result } = renderHook(() => useInViewOnce());
		expect(result.current.inView).toBe(true);
	});
});
