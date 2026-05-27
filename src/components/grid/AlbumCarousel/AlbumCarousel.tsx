/**
 * AlbumCarousel - Horizontal carousel of albums for the current face (API-backed)
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
import { useAlbumsGridQuery } from '../../../hooks/api/gridQueries';
import { albumCoverPlaceholderUrl } from '../gridDisplayHelpers';
import { GridMediaImage } from '../../GridMediaImage/GridMediaImage';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import './AlbumCarousel.scss';
import type { AlbumCarouselProps } from './types';
import { CARD_WIDTH, CARD_GAP } from './constants';

export function AlbumCarousel({
	page: controlledPage,
	totalPages: _totalPages,
	onPageChange,
}: AlbumCarouselProps = {}) {
	const { t } = useTranslation('common');
	const containerRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;

	const fetchEnabled = useGridBlockFetchEnabled();
	const {
		data: albums = [],
		isLoading: loading,
		isError: loadError,
	} = useAlbumsGridQuery(token, faceId, fetchEnabled);
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

	const totalPages = Math.max(1, Math.ceil(albums.length / visibleCount));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleAlbums = useMemo(
		() => albums.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
		[albums, clampedPage, visibleCount]
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
			<div
				className="album-carousel-component album-carousel-component--message"
				ref={containerRef}
			>
				<p>{t(k.guest.albums)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				className="album-carousel-component album-carousel-component--message"
				ref={containerRef}
			>
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div
				className="album-carousel-component album-carousel-component--message"
				ref={containerRef}
			>
				<p>{t(k.loadError.albums)}</p>
			</div>
		);
	}

	return (
		<div className="album-carousel-component" ref={containerRef}>
			{showInternalNav && (
				<button
					type="button"
					className="album-carousel-nav album-carousel-prev"
					disabled={clampedPage === 0}
					onClick={() => setPage((p) => p - 1)}
				>
					‹
				</button>
			)}

			<div className="album-carousel-track">
				{visibleAlbums.map((album, index) => (
					<div
						key={album.id}
						className="album-carousel-card"
						style={{ width: CARD_WIDTH }}
						onClick={() => navigate(getLocalizedPath(`/album/${album.id}`))}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter') navigate(getLocalizedPath(`/album/${album.id}`));
						}}
					>
						<GridMediaImage
							src={albumCoverPlaceholderUrl(album.id)}
							alt={album.title}
							priority={index === 0}
						/>
						<div className="album-carousel-card-info">
							<span className="album-carousel-card-title">{album.title}</span>
							<span className="album-carousel-card-count">
								♥ {album.likesCount} · 💬 {album.commentsCount}
							</span>
						</div>
					</div>
				))}
			</div>

			{showInternalNav && (
				<button
					type="button"
					className="album-carousel-nav album-carousel-next"
					disabled={clampedPage >= totalPages - 1}
					onClick={() => setPage((p) => p + 1)}
				>
					›
				</button>
			)}

			{showInternalNav && totalPages > 1 && (
				<div className="album-carousel-dots">
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i}
							type="button"
							className={`album-carousel-dot ${i === clampedPage ? 'active' : ''}`}
							onClick={() => setPage(i)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
