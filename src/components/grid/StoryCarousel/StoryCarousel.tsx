/**
 * StoryCarousel - Stories carousel for the current face (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { fetchStoriesForFace, type StoryListItem } from '../../../api/services/storiesApi';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import { useStoryRingSlideshow } from '../../../hooks/useStoryRingSlideshow';
import './StoryCarousel.scss';
import { CARD_WIDTH, CARD_GAP } from './constants';
import type { StoryCarouselProps } from './types';

function StoryCarouselCard({
	story,
	token,
	faceId,
	listHref,
}: {
	story: StoryListItem;
	token: string;
	faceId: number;
	listHref: string;
}) {
	const { src, ringHandlers } = useStoryRingSlideshow(token, faceId, story);
	return (
		<Link
			className="story-carousel-card"
			style={{ width: CARD_WIDTH }}
			to={listHref}
			{...ringHandlers}
		>
			<div className="story-carousel-thumb">
				<img src={src} alt={story.creatorName || story.title} loading="lazy" />
			</div>
			<span className="story-carousel-card-name">{story.creatorName || 'Story'}</span>
		</Link>
	);
}

export function StoryCarousel({
	page: controlledPage,
	totalPages: _totalPages,
	onPageChange,
}: StoryCarouselProps = {}) {
	const { t } = useTranslation('common');
	const containerRef = useRef<HTMLDivElement>(null);
	const getLocalizedPath = useLocalizedLink();
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;
	const faceIndex = selectedFace?.index;

	const [stories, setStories] = useState<StoryListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [visibleCount, setVisibleCount] = useState(4);
	const [internalPage, setInternalPage] = useState(0);
	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const calcVisible = useCallback(() => {
		if (!containerRef.current) return;
		const w = containerRef.current.clientWidth - 60;
		const count = Math.max(1, Math.floor((w + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
		setVisibleCount(count);
	}, []);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		queueMicrotask(() => calcVisible());
		const ro = new ResizeObserver(() => calcVisible());
		ro.observe(el);
		return () => ro.disconnect();
	}, [calcVisible]);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			await Promise.resolve();
			if (!token || faceId == null) {
				if (!cancelled) {
					setStories([]);
					setLoading(false);
				}
				return;
			}
			if (!cancelled) {
				setLoading(true);
				setLoadError(false);
			}
			try {
				const list = await fetchStoriesForFace(token, faceId);
				if (!cancelled) setStories(list);
			} catch {
				if (!cancelled) {
					setLoadError(true);
					setStories([]);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [token, faceId]);

	const totalPages = Math.max(1, Math.ceil(stories.length / visibleCount));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleStories = useMemo(
		() => stories.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
		[stories, clampedPage, visibleCount]
	);

	const emitPage = useStablePaginationEmit(onPageChange);
	useSyncedPaginationReport(emitPage, clampedPage, totalPages);

	const setPage = useCallback(
		(value: number | ((prev: number) => number)) => {
			const next =
				typeof value === 'function'
					? value(isControlled ? (controlledPage ?? 0) : internalPage)
					: value;
			if (isControlled) emitPage(Math.max(0, Math.min(next, totalPages - 1)), totalPages);
			else setInternalPage(next);
		},
		[isControlled, controlledPage, internalPage, totalPages, emitPage]
	);

	const showInternalNav = !isControlled;
	const listHref = faceIndex ? getLocalizedPath(`${faceIndex}/stories`) : '#';

	if (!token || faceId == null || !faceIndex) {
		return (
			<div
				className="story-carousel-component story-carousel-component--message"
				ref={containerRef}
			>
				<p>{t(k.guest.stories)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				className="story-carousel-component story-carousel-component--message"
				ref={containerRef}
			>
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div
				className="story-carousel-component story-carousel-component--message"
				ref={containerRef}
			>
				<p>{t(k.loadError.stories)}</p>
			</div>
		);
	}

	return (
		<div className="story-carousel-component" ref={containerRef}>
			{showInternalNav && (
				<button
					type="button"
					className="story-carousel-nav story-carousel-prev"
					disabled={clampedPage === 0}
					onClick={() => setPage((p) => p - 1)}
				>
					‹
				</button>
			)}

			<div className="story-carousel-track">
				{visibleStories.map((story) => (
					<StoryCarouselCard
						key={story.id}
						story={story}
						token={token!}
						faceId={faceId!}
						listHref={listHref}
					/>
				))}
			</div>

			{showInternalNav && (
				<button
					type="button"
					className="story-carousel-nav story-carousel-next"
					disabled={clampedPage >= totalPages - 1}
					onClick={() => setPage((p) => p + 1)}
				>
					›
				</button>
			)}

			{showInternalNav && totalPages > 1 && (
				<div className="story-carousel-dots">
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i}
							type="button"
							className={`story-carousel-dot ${i === clampedPage ? 'active' : ''}`}
							onClick={() => setPage(i)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
