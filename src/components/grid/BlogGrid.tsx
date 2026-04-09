/**
 * BlogGrid - Paginated grid of blog posts for the current face (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { getBlogs, type BlogItem } from '../../api/services/BlogsService';
import {
  useStablePaginationEmit,
  useSyncedPaginationReport,
} from '../../hooks/usePaginationParentSync';
import { useFillGridPagination } from '../../hooks/useFillGridPagination';
import './BlogGrid.scss';

function blogCover(blog: BlogItem): string {
  const first = blog.images?.[0]?.imageUrl;
  if (first) return first;
  return `https://picsum.photos/seed/bloggrid${blog.id}/400/250`;
}

function excerpt(text: string, max = 100): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export interface BlogGridProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function BlogGrid({ page: controlledPage, onPageChange }: BlogGridProps = {}) {
  const itemsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const faceId = selectedFace?.id;

  const [posts, setPosts] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
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

  useEffect(() => {
    if (!token || faceId == null) {
      setPosts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const list = await getBlogs(token, faceId);
        if (!cancelled) setPosts(list);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, faceId]);

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

  if (!token || faceId == null) {
    return (
      <div className="blog-grid-component blog-grid-component--message">
        <p>Sign in to see blog posts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="blog-grid-component blog-grid-component--message">
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="blog-grid-component blog-grid-component--message">
        <p>Could not load blog posts.</p>
      </div>
    );
  }

  const itemsStyle = { '--grid-cols': gridCols } as CSSProperties;

  return (
    <div className="blog-grid-component">
      <div className="blog-grid-items" ref={itemsRef} style={itemsStyle}>
        {visiblePosts.map((post) => (
          <div
            key={post.id}
            className="blog-grid-card"
            onClick={() => navigate(getLocalizedPath(`/blog/${post.id}`))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(getLocalizedPath(`/blog/${post.id}`));
            }}
          >
            <img src={blogCover(post)} alt={post.title} loading="lazy" />
            <div className="blog-grid-card-info">
              <span className="blog-grid-card-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span className="blog-grid-card-title">{post.title}</span>
              <span className="blog-grid-card-excerpt">{excerpt(post.content)}</span>
            </div>
          </div>
        ))}
      </div>
      {posts.length === 0 && <p className="blog-grid-empty">No blog posts yet.</p>}
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
