/**
 * AdCarousel - Wall tickets carousel for the current face (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useAdsGridQuery } from '../../../hooks/api/gridQueries';
import { wallTicketListingImageUrl } from '../gridDisplayHelpers';
import { GridMediaImage } from '../../GridMediaImage/GridMediaImage';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import './AdCarousel.scss';
import type { AdCarouselProps } from './types';
import { CARD_WIDTH, CARD_GAP } from './constants';

export function AdCarousel({
	page: controlledPage,
	totalPages: _totalPages,
	onPageChange,
}: AdCarouselProps = {}) {
	const { t } = useTranslation('common');
	const containerRef = useRef<HTMLDivElement>(null);
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;

	const fetchEnabled = useGridBlockFetchEnabled();
	const {
		data: items = [],
		isLoading: loading,
		isError: loadError,
	} = useAdsGridQuery(token, faceId, fetchEnabled);
	const [visibleCount, setVisibleCount] = useState(3);
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

	const totalPages = Math.max(1, Math.ceil(items.length / visibleCount));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleAds = useMemo(
		() => items.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
		[items, clampedPage, visibleCount]
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
			<div className="ad-carousel-component ad-carousel-component--message" ref={containerRef}>
				<p>{t(k.guest.listings)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="ad-carousel-component ad-carousel-component--message" ref={containerRef}>
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="ad-carousel-component ad-carousel-component--message" ref={containerRef}>
				<p>{t(k.loadError.listings)}</p>
			</div>
		);
	}

	return (
		<div className="ad-carousel-component" ref={containerRef}>
			{showInternalNav && (
				<button
					type="button"
					className="ad-carousel-nav ad-carousel-prev"
					disabled={clampedPage === 0}
					onClick={() => setPage((p) => p - 1)}
				>
					‹
				</button>
			)}

			<div className="ad-carousel-track">
				{visibleAds.map((ad, index) => (
					<div key={ad.id} className="ad-carousel-card" style={{ width: CARD_WIDTH }}>
						<GridMediaImage
							src={wallTicketListingImageUrl(ad.id)}
							alt={ad.title}
							priority={index === 0}
						/>
						<div className="ad-carousel-card-info">
							<span className="ad-carousel-card-price">{t(k.wallLabel)}</span>
							<span className="ad-carousel-card-title">{ad.title}</span>
							<span className="ad-carousel-card-location">{ad.creatorName}</span>
						</div>
					</div>
				))}
			</div>

			{showInternalNav && (
				<button
					type="button"
					className="ad-carousel-nav ad-carousel-next"
					disabled={clampedPage >= totalPages - 1}
					onClick={() => setPage((p) => p + 1)}
				>
					›
				</button>
			)}

			{showInternalNav && totalPages > 1 && (
				<div className="ad-carousel-dots">
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i}
							type="button"
							className={`ad-carousel-dot ${i === clampedPage ? 'active' : ''}`}
							onClick={() => setPage(i)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
