/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStoryRingSlideshow } from '@/hooks/useStoryRingSlideshow';

vi.mock('@/api/services/storiesApi', () => ({
	fetchStorySlideshowImageUrls: vi.fn(async () => ['https://a/img1.jpg', 'https://a/img2.jpg']),
}));

const story = {
	id: 42,
	title: 'Story',
	coverUrl: 'https://cover',
	authorName: 'A',
	createdAt: '2026-01-01',
};

describe('useStoryRingSlideshow (PT-RP19)', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it('PT-RP19-U1: unmount clears interval via stop on mouse leave', async () => {
		const { result, unmount } = renderHook(() => useStoryRingSlideshow('token', 1, story as never));
		await act(async () => {
			await result.current.ringHandlers.onMouseEnter?.({} as never);
		});
		act(() => {
			result.current.ringHandlers.onMouseLeave?.({} as never);
		});
		unmount();
		expect(result.current.src).toContain('cover');
	});

	it('PT-RP19-U2: hidden document skips slideshow start', async () => {
		Object.defineProperty(document, 'hidden', { configurable: true, value: true });
		const { result } = renderHook(() => useStoryRingSlideshow('token', 1, story as never));
		await act(async () => {
			await result.current.ringHandlers.onMouseEnter?.({} as never);
		});
		const { fetchStorySlideshowImageUrls } = await import('@/api/services/storiesApi');
		expect(fetchStorySlideshowImageUrls).not.toHaveBeenCalled();
		Object.defineProperty(document, 'hidden', { configurable: true, value: false });
	});

	it('no token — start is no-op', async () => {
		const { fetchStorySlideshowImageUrls } = await import('@/api/services/storiesApi');
		const { result } = renderHook(() => useStoryRingSlideshow(null, 1, story as never));
		await act(async () => {
			await result.current.ringHandlers.onMouseEnter?.({} as never);
		});
		expect(fetchStorySlideshowImageUrls).not.toHaveBeenCalled();
	});
});
