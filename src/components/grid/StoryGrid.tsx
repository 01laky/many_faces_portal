/**
 * StoryGrid - Published stories for the current face (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { fetchStoriesForFace, type StoryListItem } from '../../api/services/storiesApi';
import { storyRingImageUrl } from './gridDisplayHelpers';
import './StoryGrid.scss';

const CARD_MIN_W = 90;
const CARD_MIN_H = 110;

export interface StoryGridProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function StoryGrid({ page: controlledPage, onPageChange }: StoryGridProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const getLocalizedPath = useLocalizedLink();
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const faceId = selectedFace?.id;
  const faceIndex = selectedFace?.index;

  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = onPageChange != null;
  const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

  const calcItems = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const paginationHeight = 32;
    const availH = clientHeight - paginationHeight;
    const cols = Math.max(1, Math.floor(clientWidth / CARD_MIN_W));
    const rows = Math.max(1, Math.floor(availH / CARD_MIN_H));
    setItemsPerPage(cols * rows);
  }, []);

  useEffect(() => {
    calcItems();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => calcItems());
    ro.observe(el);
    return () => ro.disconnect();
  }, [calcItems]);

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

  useEffect(() => {
    onPageChange?.(clampedPage, totalPages);
  }, [clampedPage, totalPages, onPageChange]);

  const setPage = useCallback(
    (value: number | ((prev: number) => number)) => {
      const next =
        typeof value === 'function'
          ? value(isControlled ? (controlledPage ?? 0) : internalPage)
          : value;
      if (isControlled) onPageChange?.(Math.max(0, Math.min(next, totalPages - 1)), totalPages);
      else setInternalPage(next);
    },
    [isControlled, controlledPage, internalPage, totalPages, onPageChange]
  );

  const showInternalPagination = !isControlled;
  const listHref = faceIndex ? getLocalizedPath(`${faceIndex}/stories`) : '#';

  if (!token || faceId == null || !faceIndex) {
    return (
      <div className="story-grid-component story-grid-component--message" ref={containerRef}>
        <p>Sign in to see stories.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="story-grid-component story-grid-component--message" ref={containerRef}>
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="story-grid-component story-grid-component--message" ref={containerRef}>
        <p>Could not load stories.</p>
      </div>
    );
  }

  return (
    <div className="story-grid-component" ref={containerRef}>
      <div className="story-grid-items">
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
