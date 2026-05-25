/**
 * AlbumGrid - Paginated grid of album cards (API, current face).
 * Layout (cols, rows, tile size, itemsPerPage) is derived from the items container via TypeScript + ResizeObserver.
 */

import {
	useState,
	useRef,
	useEffect,
	useLayoutEffect,
	useCallback,
	useMemo,
	type CSSProperties,
} from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { getAlbums, type AlbumItem } from '../../../api/services/AlbumsService';
import { albumCoverPlaceholderUrl } from '../gridDisplayHelpers';
import { CreatorModerationBadge } from '../CreatorModerationBadge';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import {
	computeAlbumGridLayout,
	type AlbumGridLayout,
} from '../../../utils/computeAlbumGridLayout';
import './AlbumGrid.scss';
import { DEFAULT_ITEMS_PER_PAGE, ALBUM_GRID_LAYOUT_OPTS } from './constants';
import type { AlbumGridProps } from './types';

function albumCardLayoutProps(layout: AlbumGridLayout): {
	style: CSSProperties;
	'data-album-tile-px': string;
	'data-album-grid-cols': string;
	'data-album-grid-rows': string;
} {
	const px = `${layout.tilePx}px`;
	return {
		style: {
			width: layout.tilePx,
			height: layout.tilePx,
			boxSizing: 'border-box',
			['--album-tile-px' as string]: px,
		},
		'data-album-tile-px': String(layout.tilePx),
		'data-album-grid-cols': String(layout.cols),
		'data-album-grid-rows': String(layout.rows),
	};
}

export function AlbumGrid({ page: controlledPage, onPageChange }: AlbumGridProps = {}) {
	const { t } = useTranslation('common');
	const itemsRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;

	const [albums, setAlbums] = useState<AlbumItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [internalPage, setInternalPage] = useState(0);
	const [gridLayout, setGridLayout] = useState<AlbumGridLayout | null>(null);

	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const observeGrid = Boolean(token) && faceId != null && !loading && !loadError;

	const measureGridLayout = useCallback(() => {
		const el = itemsRef.current;
		if (!el) return;
		const w = el.clientWidth;
		const h = el.clientHeight;
		if (w <= 0 || h <= 0) return;
		const next = computeAlbumGridLayout(w, h, ALBUM_GRID_LAYOUT_OPTS);
		if (!next) return;
		setGridLayout((prev) =>
			prev &&
			prev.cols === next.cols &&
			prev.rows === next.rows &&
			prev.tilePx === next.tilePx &&
			prev.itemsPerPage === next.itemsPerPage
				? prev
				: next
		);
	}, []);

	useLayoutEffect(() => {
		if (!observeGrid) {
			queueMicrotask(() => setGridLayout(null));
			return;
		}
		const el = itemsRef.current;
		if (!el) return;
		queueMicrotask(() => measureGridLayout());
		const ro = new ResizeObserver(() => measureGridLayout());
		ro.observe(el);
		return () => ro.disconnect();
	}, [observeGrid, measureGridLayout]);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			await Promise.resolve();
			if (!token || faceId == null) {
				if (!cancelled) {
					setAlbums([]);
					setLoading(false);
				}
				return;
			}
			if (!cancelled) {
				setLoading(true);
				setLoadError(false);
			}
			try {
				const list = await getAlbums(token, faceId);
				if (!cancelled) setAlbums(list);
			} catch {
				if (!cancelled) {
					setLoadError(true);
					setAlbums([]);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [token, faceId]);

	const itemsPerPage = gridLayout?.itemsPerPage ?? DEFAULT_ITEMS_PER_PAGE;

	const totalPages = Math.max(1, Math.ceil(albums.length / itemsPerPage));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleAlbums = useMemo(
		() => albums.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
		[albums, clampedPage, itemsPerPage]
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

	const showInternalPagination = !isControlled;

	if (!token || faceId == null) {
		return (
			<div className="album-grid-component album-grid-component--message">
				<p>{t(k.guest.albums)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="album-grid-component album-grid-component--message">
				<Loader2 size={28} className="album-grid-spinner" aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="album-grid-component album-grid-component--message">
				<p>{t(k.loadError.albums)}</p>
			</div>
		);
	}

	const itemsStyle = {
		...(gridLayout
			? {
					gridTemplateColumns: `repeat(${gridLayout.cols}, minmax(0, 1fr))`,
					gridTemplateRows: `repeat(${gridLayout.rows}, minmax(0, 1fr))`,
				}
			: { '--grid-cols': 2 }),
	} as CSSProperties;

	const sizedClass = gridLayout ? ' album-grid-items--sized' : '';

	return (
		<div className="album-grid-component">
			<div className={`album-grid-items${sizedClass}`} ref={itemsRef} style={itemsStyle}>
				{visibleAlbums.map((album) => {
					const layoutProps = gridLayout ? albumCardLayoutProps(gridLayout) : null;
					return (
						<div
							key={album.id}
							className={`album-grid-card${gridLayout ? ' album-grid-card--sized' : ''}`}
							{...(layoutProps ?? {})}
							onClick={() => navigate(getLocalizedPath(`/album/${album.id}`))}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter') navigate(getLocalizedPath(`/album/${album.id}`));
							}}
						>
							<div className="album-grid-card-cover">
								<img src={albumCoverPlaceholderUrl(album.id)} alt={album.title} loading="lazy" />
							</div>
							<div className="album-grid-card-info">
								<span className="album-grid-card-title">{album.title}</span>
								<CreatorModerationBadge
									approvalStatus={album.approvalStatus}
									aiReviewStatus={album.aiReviewStatus}
									aiReviewUserMessage={album.aiReviewUserMessage}
									humanDecisionReason={album.humanDecisionReason}
								/>
								<span className="album-grid-card-count">
									♥ {album.likesCount} · 💬 {album.commentsCount}
								</span>
							</div>
						</div>
					);
				})}
			</div>
			{albums.length === 0 && <p className="album-grid-empty">{t(k.empty.albumsFace)}</p>}
			{showInternalPagination && totalPages > 1 && (
				<div className="album-grid-pagination">
					<button type="button" disabled={clampedPage === 0} onClick={() => setPage((p) => p - 1)}>
						‹
					</button>
					<span>
						{clampedPage + 1} / {totalPages}
					</span>
					<button
						type="button"
						disabled={clampedPage >= totalPages - 1}
						onClick={() => setPage((p) => p + 1)}
					>
						›
					</button>
				</div>
			)}
		</div>
	);
}
