/**
 * AdGrid - Wall tickets as listing cards for the current face (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import {
	fetchAllWallTicketsForFace,
	type WallTicketListItem,
} from '../../../api/services/wallTicketsApi';
import { wallTicketListingImageUrl } from '../gridDisplayHelpers';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import { useFillGridPagination } from '../../../hooks/useFillGridPagination';
import './AdGrid.scss';

export interface AdGridProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number, totalPages: number) => void;
}

export function AdGrid({ page: controlledPage, onPageChange }: AdGridProps = {}) {
	const { t } = useTranslation('common');
	const itemsRef = useRef<HTMLDivElement>(null);
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;

	const [items, setItems] = useState<WallTicketListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [internalPage, setInternalPage] = useState(0);
	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const observeGrid = Boolean(token) && faceId != null && !loading && !loadError;
	const { itemsPerPage, gridCols } = useFillGridPagination(itemsRef, observeGrid, isControlled, {
		gap: 6,
		minColWidth: 130,
		imageHeightFromCellWidth: 1,
		infoBlockPx: 42,
	});

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			await Promise.resolve();
			if (!token || faceId == null) {
				if (!cancelled) {
					setItems([]);
					setLoading(false);
				}
				return;
			}
			if (!cancelled) {
				setLoading(true);
				setLoadError(false);
			}
			try {
				const list = await fetchAllWallTicketsForFace(token, faceId);
				if (!cancelled) setItems(list);
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

	const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleAds = useMemo(
		() => items.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
		[items, clampedPage, itemsPerPage]
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
			<div className="ad-grid-component ad-grid-component--message">
				<p>{t(k.guest.listings)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="ad-grid-component ad-grid-component--message">
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="ad-grid-component ad-grid-component--message">
				<p>{t(k.loadError.wallListings)}</p>
			</div>
		);
	}

	const itemsStyle = { '--grid-cols': gridCols } as CSSProperties;

	return (
		<div className="ad-grid-component">
			<div className="ad-grid-items" ref={itemsRef} style={itemsStyle}>
				{visibleAds.map((ad) => (
					<div key={ad.id} className="ad-grid-card">
						<img src={wallTicketListingImageUrl(ad.id)} alt={ad.title} loading="lazy" />
						<div className="ad-grid-card-info">
							<span className="ad-grid-card-price">{t(k.wallLabel)}</span>
							<span className="ad-grid-card-title">{ad.title}</span>
							<span className="ad-grid-card-location">{ad.creatorName}</span>
						</div>
					</div>
				))}
			</div>
			{items.length === 0 && <p className="ad-grid-empty">{t(k.empty.listings)}</p>}
			{showInternalPagination && totalPages > 1 && (
				<div className="ad-grid-pagination">
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
