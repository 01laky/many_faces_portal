/**
 * StoryGrid - Published stories for the current face (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { fetchStoriesForFace, type StoryListItem } from '../../api/services/storiesApi';
import { storyRingImageUrl } from './gridDisplayHelpers';
import {
  useStablePaginationEmit,
  useSyncedPaginationReport,
} from '../../hooks/usePaginationParentSync';
import { useFillGridPagination } from '../../hooks/useFillGridPagination';
import './StoryGrid.scss';

export interface StoryGridProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function StoryGrid({ page: controlledPage, onPageChange }: StoryGridProps = {}) {
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
  const isControlled = onPageChange != null;
  const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

  const observeGrid =
    Boolean(token) && faceId != null && Boolean(faceIndex) && !loading && !loadError;
  const { itemsPerPage, gridCols } = useFillGridPagination(itemsRef, observeGrid, isControlled, {
    gap: 6,
    minColWidth: 72,
    fixedCardHeightPx: 76,
  });

  useEffect(() => {
    if (!token || faceId == null) {
      setStories([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
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
        <p>Sign in to see stories.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="story-grid-component story-grid-component--message">
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="story-grid-component story-grid-component--message">
        <p>Could not load stories.</p>
      </div>
    );
  }

  const itemsStyle = { '--grid-cols': gridCols } as CSSProperties;

  return (
    <div className="story-grid-component">
      <div className="story-grid-items" ref={itemsRef} style={itemsStyle}>
        {visibleStories.map((story) => (
          <Link key={story.id} className="story-grid-card" to={listHref}>
            <div className="story-grid-ring">
              <img
                src={storyRingImageUrl(story.id, story.coverUrl)}
                alt={story.title}
                loading="lazy"
              />
            </div>
            <span className="story-grid-card-name">{story.creatorName || 'Story'}</span>
          </Link>
        ))}
      </div>
      {stories.length === 0 && <p className="story-grid-empty">No active stories.</p>}
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
