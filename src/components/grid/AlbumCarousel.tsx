/**
 * AlbumCarousel - Paginated horizontal carousel of album cards
 *
 * The number of visible items recalculates based on container width.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './AlbumCarousel.scss';

const CARD_WIDTH = 160;
const CARD_GAP = 8;

interface AlbumData {
  id: number;
  title: string;
  cover: string;
  count: number;
}

function generateAlbums(total: number): AlbumData[] {
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    title: `Album ${i + 1}`,
    cover: `https://picsum.photos/seed/carousel${i + 1}/300/300`,
    count: Math.floor(Math.random() * 50) + 5,
  }));
}

const ALL_ALBUMS = generateAlbums(30);

export interface AlbumCarouselProps {
  /** Controlled page (0-based). When provided with onPageChange, footer nav is used. */
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function AlbumCarousel({
  page: controlledPage,
  totalPages: _totalPages,
  onPageChange,
}: AlbumCarouselProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = onPageChange != null;
  const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

  const calcVisible = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth - 60; // minus nav buttons
    const count = Math.max(1, Math.floor((w + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
    setVisibleCount(count);
  }, []);

  useEffect(() => {
    calcVisible();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => calcVisible());
    ro.observe(el);
    return () => ro.disconnect();
  }, [calcVisible]);

  const totalPages = Math.ceil(ALL_ALBUMS.length / visibleCount);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleAlbums = useMemo(
    () => ALL_ALBUMS.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [clampedPage, visibleCount]
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

  const showInternalNav = !isControlled;

  return (
    <div className="album-carousel-component" ref={containerRef}>
      {showInternalNav && (
        <button
          className="album-carousel-nav album-carousel-prev"
          disabled={clampedPage === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          ‹
        </button>
      )}

      <div className="album-carousel-track">
        {visibleAlbums.map((album) => (
          <div key={album.id} className="album-carousel-card" style={{ width: CARD_WIDTH }}>
            <img src={album.cover} alt={album.title} loading="lazy" />
            <div className="album-carousel-card-info">
              <span className="album-carousel-card-title">{album.title}</span>
              <span className="album-carousel-card-count">{album.count} photos</span>
            </div>
          </div>
        ))}
      </div>

      {showInternalNav && (
        <button
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
              className={`album-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
