/**
 * ReelCarousel - Horizontal carousel of reels (API-backed).
 */

import { useState, useRef, useEffect, useCallback, useMemo, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { getReels, type ReelItem } from '../../../api/services/ReelsService';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import './ReelCarousel.scss';
import { CARD_WIDTH, CARD_GAP } from './constants';
import type { ReelCarouselProps } from './types';

export function ReelCarousel({
	page: controlledPage,
	totalPages: _ignored,
	onPageChange,
}: ReelCarouselProps = {}) {
	const { t } = useTranslation('common');
	const containerRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;

	const [items, setItems] = useState<ReelItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [visibleCount, setVisibleCount] = useState(3);
	const [internalPage, setInternalPage] = useState(0);
	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const playPreview = useCallback((e: SyntheticEvent<HTMLDivElement>) => {
		const video = e.currentTarget.querySelector('video');
		if (!video) return;
		void video.play().catch(() => {});
	}, []);

	const stopPreview = useCallback((e: SyntheticEvent<HTMLDivElement>) => {
		const video = e.currentTarget.querySelector('video');
		if (!video) return;
		video.pause();
		video.currentTime = 0;
	}, []);

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
					setLoading(false);
					setItems([]);
				}
				return;
			}
			if (!cancelled) {
				setLoading(true);
				setLoadError(false);
			}
			try {
				const data = await getReels(token, faceId);
				if (!cancelled) setItems(data);
			} catch {
				if (!cancelled) {
					setLoadError(true);
					setItems([]);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [token, faceId]);

	const totalPages = Math.max(1, Math.ceil(items.length / visibleCount));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleReels = useMemo(
		() => items.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
		[clampedPage, visibleCount, items]
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

	if (!token || faceId == null) {
		return (
			<div className="reel-carousel-component reel-carousel-component--message" ref={containerRef}>
				<p>{t(k.guest.reels)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="reel-carousel-component reel-carousel-component--message" ref={containerRef}>
				<Loader2 size={24} className="reel-carousel-spinner" aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="reel-carousel-component reel-carousel-component--message" ref={containerRef}>
				<p>{t(k.loadError.reels)}</p>
			</div>
		);
	}

	return (
		<div className="reel-carousel-component" ref={containerRef}>
			{showInternalNav && (
				<button
					type="button"
					className="reel-carousel-nav reel-carousel-prev"
					disabled={clampedPage === 0}
					onClick={() => setPage((p) => p - 1)}
				>
					‹
				</button>
			)}

			<div className="reel-carousel-track">
				{visibleReels.map((reel) => (
					<div
						key={reel.id}
						className="reel-carousel-card"
						style={{ width: CARD_WIDTH }}
						onClick={() => navigate(getLocalizedPath(`/reel/${reel.id}`))}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter') navigate(getLocalizedPath(`/reel/${reel.id}`));
						}}
						onMouseEnter={playPreview}
						onMouseLeave={stopPreview}
						onFocus={playPreview}
						onBlur={stopPreview}
					>
						<video
							className="reel-carousel-card-video"
							muted
							playsInline
							loop
							preload="metadata"
							src={reel.videoUrl}
						/>
						<div className="reel-carousel-card-overlay">
							<span className="reel-carousel-card-title">{reel.title}</span>
							<span className="reel-carousel-card-likes">♥ {reel.likesCount}</span>
						</div>
					</div>
				))}
			</div>

			{showInternalNav && (
				<button
					type="button"
					className="reel-carousel-nav reel-carousel-next"
					disabled={clampedPage >= totalPages - 1}
					onClick={() => setPage((p) => p + 1)}
				>
					›
				</button>
			)}

			{showInternalNav && totalPages > 1 && (
				<div className="reel-carousel-dots">
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i}
							type="button"
							className={`reel-carousel-dot ${i === clampedPage ? 'active' : ''}`}
							onClick={() => setPage(i)}
						/>
					))}
				</div>
			)}

			{items.length === 0 && <p className="reel-carousel-empty">{t(k.empty.reelsCreate)}</p>}
		</div>
	);
}
