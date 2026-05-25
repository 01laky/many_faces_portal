/**
 * StoryGrid - Published stories for the current face (API-backed).
 * Layout (cols, rows, thumb size, itemsPerPage) from container size — same idea as AlbumGrid.
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
import {
	computeStoryGridLayout,
	type StoryGridLayout,
} from '../../../utils/computeStoryGridLayout';
import './StoryGrid.scss';

const STORY_GRID_GAP = 8;
const STORY_LABEL_PX = 22;
const DEFAULT_ITEMS_PER_PAGE = 8;

/** Floor for thumb width; thumb image height = 2× (1:2). 75px → 150px tall vs former 44→88 (~+70% height). */
const STORY_MIN_THUMB_WIDTH_PX = 75;

const STORY_GRID_LAYOUT_OPTS = {
	gap: STORY_GRID_GAP,
	minThumbWidthPx: STORY_MIN_THUMB_WIDTH_PX,
	labelPx: STORY_LABEL_PX,
	maxCols: 12,
	maxRows: 10,
	maxItemsPerPage: 60,
} as const;

function StoryGridCard({
	story,
	token,
	faceId,
	listHref,
	thumbW,
	labelPx,
}: {
	story: StoryListItem;
	token: string;
	faceId: number;
	listHref: string;
	thumbW: number;
	labelPx: number;
}) {
	const { src, ringHandlers } = useStoryRingSlideshow(token, faceId, story);
	const thumbH = thumbW * 2;
	return (
		<Link
			className="story-grid-card story-grid-card--sized"
			to={listHref}
			style={{ width: thumbW, height: thumbH + labelPx }}
			{...ringHandlers}
		>
			<div className="story-grid-thumb" style={{ width: thumbW, height: thumbH }}>
				<img src={src} alt={story.title} loading="lazy" />
			</div>
			<span className="story-grid-card-name">{story.creatorName || 'Story'}</span>
		</Link>
	);
}

function StoryGridCardFallback({
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
		<Link className="story-grid-card" to={listHref} {...ringHandlers}>
			<div className="story-grid-thumb story-grid-thumb--fallback">
				<img src={src} alt={story.title} loading="lazy" />
			</div>
			<span className="story-grid-card-name">{story.creatorName || 'Story'}</span>
		</Link>
	);
}

export interface StoryGridProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number, totalPages: number) => void;
}

export function StoryGrid({ page: controlledPage, onPageChange }: StoryGridProps = {}) {
	const { t } = useTranslation('common');
	const itemsRef = useRef<HTMLDivElement>(null);
	const getLocalizedPath = useLocalizedLink();
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;
	const faceIndex = selectedFace?.index;

	const [stories, setStories] = useState<StoryListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [internalPage, setInternalPage] = useState(0);
	const [gridLayout, setGridLayout] = useState<StoryGridLayout | null>(null);

	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const observeGrid =
		Boolean(token) && faceId != null && Boolean(faceIndex) && !loading && !loadError;

	const measureGridLayout = useCallback(() => {
		const el = itemsRef.current;
		if (!el) return;
		const w = el.clientWidth;
		const h = el.clientHeight;
		if (w <= 0 || h <= 0) return;
		const next = computeStoryGridLayout(w, h, STORY_GRID_LAYOUT_OPTS);
		if (!next) return;
		setGridLayout((prev) =>
			prev &&
			prev.cols === next.cols &&
			prev.rows === next.rows &&
			prev.thumbW === next.thumbW &&
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

	const itemsPerPage = gridLayout?.itemsPerPage ?? DEFAULT_ITEMS_PER_PAGE;

	const totalPages = Math.max(1, Math.ceil(stories.length / itemsPerPage));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleStories = useMemo(
		() => stories.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
		[stories, clampedPage, itemsPerPage]
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
	const listHref = faceIndex ? getLocalizedPath(`${faceIndex}/stories`) : '#';

	if (!token || faceId == null || !faceIndex) {
		return (
			<div className="story-grid-component story-grid-component--message">
				<p>{t(k.guest.stories)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="story-grid-component story-grid-component--message">
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="story-grid-component story-grid-component--message">
				<p>{t(k.loadError.stories)}</p>
			</div>
		);
	}

	const itemsStyle = {
		gap: STORY_GRID_GAP,
		...(gridLayout
			? {
					gridTemplateColumns: `repeat(${gridLayout.cols}, minmax(0, 1fr))`,
					gridTemplateRows: `repeat(${gridLayout.rows}, minmax(0, 1fr))`,
				}
			: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }),
	} as CSSProperties;

	const sizedClass = gridLayout ? ' story-grid-items--sized' : '';

	return (
		<div className="story-grid-component">
			<div className={`story-grid-items${sizedClass}`} ref={itemsRef} style={itemsStyle}>
				{visibleStories.map((story) =>
					gridLayout ? (
						<StoryGridCard
							key={story.id}
							story={story}
							token={token}
							faceId={faceId}
							listHref={listHref}
							thumbW={gridLayout.thumbW}
							labelPx={STORY_LABEL_PX}
						/>
					) : (
						<StoryGridCardFallback
							key={story.id}
							story={story}
							token={token}
							faceId={faceId}
							listHref={listHref}
						/>
					)
				)}
			</div>
			{stories.length === 0 && <p className="story-grid-empty">{t(k.empty.storiesActive)}</p>}
			{showInternalPagination && totalPages > 1 && (
				<div className="story-grid-pagination">
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
