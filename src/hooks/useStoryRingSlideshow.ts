import { useCallback, useEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react';
import { fetchStorySlideshowImageUrls, type StoryListItem } from '../api/services/storiesApi';
import { storyRingImageUrl } from '../components/grid/gridDisplayHelpers';

const SLIDE_MS = 1600;

/**
 * Hover/focus: cycle story images like a slideshow when the API reports more than one image.
 */
export function useStoryRingSlideshow(
	token: string | null,
	faceId: number | null,
	story: StoryListItem
): {
	src: string;
	ringHandlers: Pick<
		HTMLAttributes<HTMLElement>,
		'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur'
	>;
} {
	const defaultSrc = useMemo(
		() => storyRingImageUrl(story.id, story.coverUrl),
		[story.id, story.coverUrl]
	);

	const [urls, setUrls] = useState<string[] | null>(null);
	const [idx, setIdx] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const hoverActive = useRef(false);
	const activeStoryIdRef = useRef<number | null>(null);

	const stop = useCallback(() => {
		hoverActive.current = false;
		activeStoryIdRef.current = null;
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setUrls(null);
		setIdx(0);
	}, []);

	const start = useCallback(async () => {
		if (!token || faceId == null) return;
		if (typeof document !== 'undefined' && document.hidden) return;
		hoverActive.current = true;
		const sid = story.id;
		activeStoryIdRef.current = sid;

		try {
			const list = await fetchStorySlideshowImageUrls(token, story.id, faceId);
			if (!hoverActive.current || activeStoryIdRef.current !== sid) return;
			if (list.length <= 1) return;

			setUrls(list);
			setIdx(0);
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			intervalRef.current = setInterval(() => {
				setIdx((i) => i + 1);
			}, SLIDE_MS);
		} catch {
			/* keep default cover */
		}
	}, [token, faceId, story.id]);

	useEffect(() => () => stop(), [stop]);

	useEffect(() => {
		const onVisibility = () => {
			if (document.visibilityState === 'hidden') stop();
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	}, [stop]);

	const src = urls && urls.length > 0 ? urls[Math.abs(idx) % urls.length] : defaultSrc;

	const ringHandlers = useMemo(
		() => ({
			onMouseEnter: start,
			onMouseLeave: stop,
			onFocus: start,
			onBlur: stop,
		}),
		[start, stop]
	);

	return { src, ringHandlers };
}
