/**
 * BlogGrid - Paginated grid of blog posts for the current face (API-backed)
 */

import { useState, useRef, useCallback, useMemo, memo, type CSSProperties } from 'react';
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
import { CreatorModerationBadge } from '../CreatorModerationBadge';
import { GridMediaImage } from '../../GridMediaImage/GridMediaImage';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import { useFillGridPagination } from '../../../hooks/useFillGridPagination';
import { blogCoverPlaceholderUrl } from '../gridDisplayHelpers';
import './BlogGrid.scss';
import type { BlogGridCardProps, BlogGridProps } from './types';

export const BlogGridCard = memo(function BlogGridCard({ post, index, onOpen }: BlogGridCardProps) {
	return (
		<div
			className="blog-grid-card"
			onClick={() => onOpen(post.id)}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter') onOpen(post.id);
			}}
		>
			<GridMediaImage src={blogCover(post)} alt={post.title} priority={index === 0} />
			<div className="blog-grid-card-info">
				<span className="blog-grid-card-date">{new Date(post.createdAt).toLocaleDateString()}</span>
				<span className="blog-grid-card-title">{post.title}</span>
				<CreatorModerationBadge
					approvalStatus={post.approvalStatus}
					aiReviewStatus={post.aiReviewStatus}
					aiReviewUserMessage={post.aiReviewUserMessage}
					humanDecisionReason={post.humanDecisionReason}
				/>
				<span className="blog-grid-card-excerpt">{excerpt(post.content)}</span>
			</div>
		</div>
	);
});

function blogCover(blog: BlogItem): string {
	const first = blog.images?.[0]?.imageUrl;
	if (first) return first;
	return blogCoverPlaceholderUrl();
}

function excerpt(text: string, max = 100): string {
	const t = text.replace(/\s+/g, ' ').trim();
	return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function BlogGrid({ page: controlledPage, onPageChange }: BlogGridProps = {}) {
	const { t } = useTranslation('common');
	const itemsRef = useRef<HTMLDivElement>(null);
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
	const [internalPage, setInternalPage] = useState(0);
	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const observeGrid = Boolean(token) && faceId != null && !loading && !loadError;
	const { itemsPerPage, gridCols } = useFillGridPagination(itemsRef, observeGrid, isControlled, {
		gap: 6,
		minColWidth: 160,
		imageHeightFromCellWidth: 10 / 16,
		infoBlockPx: 68,
	});

	const totalPages = Math.max(1, Math.ceil(posts.length / itemsPerPage));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visiblePosts = useMemo(
		() => posts.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
		[posts, clampedPage, itemsPerPage]
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

	const openPost = useCallback(
		(postId: number) => navigate(getLocalizedPath(`/blog/${postId}`)),
		[navigate, getLocalizedPath]
	);

	if (!token || faceId == null) {
		return (
			<div className="blog-grid-component blog-grid-component--message">
				<p>{t(k.guest.blogs)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="blog-grid-component blog-grid-component--message">
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="blog-grid-component blog-grid-component--message">
				<p>{t(k.loadError.blogs)}</p>
			</div>
		);
	}

	const itemsStyle = { '--grid-cols': gridCols } as CSSProperties;

	return (
		<div className="blog-grid-component">
			<div className="blog-grid-items" ref={itemsRef} style={itemsStyle}>
				{visiblePosts.map((post, index) => (
					<BlogGridCard key={post.id} post={post} index={index} onOpen={openPost} />
				))}
			</div>
			{posts.length === 0 && <p className="blog-grid-empty">{t(k.empty.blogs)}</p>}
			{showInternalPagination && totalPages > 1 && (
				<div className="blog-grid-pagination">
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
