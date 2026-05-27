/**
 * BlogCarousel - Blog posts carousel for the current face (API-backed)
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
import { useBlogsGridQuery } from '../../../hooks/api/gridQueries';
import type { BlogItem } from '../../../api/services/BlogsService';
import { GridMediaImage } from '../../GridMediaImage/GridMediaImage';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import { blogCoverPlaceholderUrl } from '../gridDisplayHelpers';
import './BlogCarousel.scss';
import { CARD_WIDTH, CARD_GAP } from './constants';
import type { BlogCarouselProps } from './types';

function blogCover(blog: BlogItem): string {
	const first = blog.images?.[0]?.imageUrl;
	if (first) return first;
	return blogCoverPlaceholderUrl();
}

export function BlogCarousel({
	page: controlledPage,
	totalPages: _totalPages,
	onPageChange,
}: BlogCarouselProps = {}) {
	const { t } = useTranslation('common');
	const containerRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;

	const fetchEnabled = useGridBlockFetchEnabled();
	const {
		data: posts = [],
		isLoading: loading,
		isError: loadError,
	} = useBlogsGridQuery(token, faceId, fetchEnabled);
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

	const totalPages = Math.max(1, Math.ceil(posts.length / visibleCount));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visiblePosts = useMemo(
		() => posts.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
		[posts, clampedPage, visibleCount]
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
			<div className="blog-carousel-component blog-carousel-component--message" ref={containerRef}>
				<p>{t(k.guest.blogs)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="blog-carousel-component blog-carousel-component--message" ref={containerRef}>
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="blog-carousel-component blog-carousel-component--message" ref={containerRef}>
				<p>{t(k.loadError.blogs)}</p>
			</div>
		);
	}

	return (
		<div className="blog-carousel-component" ref={containerRef}>
			{showInternalNav && (
				<button
					type="button"
					className="blog-carousel-nav blog-carousel-prev"
					disabled={clampedPage === 0}
					onClick={() => setPage((p) => p - 1)}
				>
					‹
				</button>
			)}

			<div className="blog-carousel-track">
				{visiblePosts.map((post, index) => (
					<div
						key={post.id}
						className="blog-carousel-card"
						style={{ width: CARD_WIDTH }}
						onClick={() => navigate(getLocalizedPath(`/blog/${post.id}`))}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter') navigate(getLocalizedPath(`/blog/${post.id}`));
						}}
					>
						<GridMediaImage src={blogCover(post)} alt={post.title} priority={index === 0} />
						<div className="blog-carousel-card-info">
							<span className="blog-carousel-card-title">{post.title}</span>
						</div>
					</div>
				))}
			</div>

			{showInternalNav && (
				<button
					type="button"
					className="blog-carousel-nav blog-carousel-next"
					disabled={clampedPage >= totalPages - 1}
					onClick={() => setPage((p) => p + 1)}
				>
					›
				</button>
			)}

			{showInternalNav && totalPages > 1 && (
				<div className="blog-carousel-dots">
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i}
							type="button"
							className={`blog-carousel-dot ${i === clampedPage ? 'active' : ''}`}
							onClick={() => setPage(i)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
