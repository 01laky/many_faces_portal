/**
 * VideoLoungeCarousel - Horizontal carousel of video lounge cards (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { useVideoLoungesGridQuery } from '../../../hooks/api/gridQueries';
import { COMPONENT_TYPE_ID } from '../../../constants/componentTypeIds';
import { VideoLoungeCard } from '../VideoLoungeCard';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import './VideoLoungeCarousel.scss';
import type { VideoLoungeCarouselProps } from './types';
import { CARD_WIDTH, CARD_GAP } from './constants';

export function VideoLoungeCarousel({
	page: controlledPage,
	totalPages: _totalPages,
	onPageChange,
}: VideoLoungeCarouselProps = {}) {
	const { t } = useTranslation('common');
	const containerRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;
	const fetchEnabled = useGridBlockFetchEnabled();
	const { data: lounges = [], isLoading: loading } = useVideoLoungesGridQuery(
		token,
		faceId,
		fetchEnabled
	);
	const [visibleCount, setVisibleCount] = useState(2);
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

	const totalPages = Math.max(1, Math.ceil(lounges.length / visibleCount));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleLounges = useMemo(
		() => lounges.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
		[clampedPage, visibleCount, lounges]
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

	const goDetail = (id: number) => {
		navigate(getLocalizedPath(`/detail/${COMPONENT_TYPE_ID.videoLoungeCarousel}/${id}`));
	};

	if (!selectedFace || !token) {
		return (
			<div className="videolounge-carousel-component" ref={containerRef}>
				<p className="videolounge-carousel-hint">{t(k.guest.videoLounges)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				className="videolounge-carousel-component videolounge-carousel-component--center"
				ref={containerRef}
			>
				<Loader2 className="videolounge-carousel-spinner" size={28} />
			</div>
		);
	}

	return (
		<div className="videolounge-carousel-component" ref={containerRef}>
			{showInternalNav && (
				<button
					className="videolounge-carousel-nav videolounge-carousel-prev"
					disabled={clampedPage === 0}
					onClick={() => setPage((p) => p - 1)}
				>
					‹
				</button>
			)}

			<div className="videolounge-carousel-track">
				{visibleLounges.map((lounge) => (
					<div key={lounge.id} className="videolounge-carousel-slot" style={{ width: CARD_WIDTH }}>
						<VideoLoungeCard lounge={lounge} onOpen={() => goDetail(lounge.id)} />
					</div>
				))}
			</div>

			{showInternalNav && (
				<button
					className="videolounge-carousel-nav videolounge-carousel-next"
					disabled={clampedPage >= totalPages - 1}
					onClick={() => setPage((p) => p + 1)}
				>
					›
				</button>
			)}

			{showInternalNav && totalPages > 1 && (
				<div className="videolounge-carousel-dots">
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i}
							type="button"
							className={`videolounge-carousel-dot ${i === clampedPage ? 'active' : ''}`}
							onClick={() => setPage(i)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
