/**
 * ReelGrid - Paginated grid of video reel cards
 *
 * The number of visible items recalculates based on the container size.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './ReelGrid.scss';

const CARD_MIN_W = 120;
const CARD_MIN_H = 200;

interface ReelData {
  id: number;
  author: string;
  likes: string;
  thumbnail: string;
}

function generateReels(total: number): ReelData[] {
  const authors = [
    '@jane_d',
    '@john_s',
    '@anna_k',
    '@peter_m',
    '@maria_l',
    '@tom_h',
    '@sara_b',
    '@mike_w',
  ];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    author: authors[i % authors.length],
    likes: `${(Math.random() * 10).toFixed(1)}k`,
    thumbnail: `https://picsum.photos/seed/reel${i + 1}/200/350`,
  }));
}

const ALL_REELS = generateReels(36);

export function ReelGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [page, setPage] = useState(0);

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

  const totalPages = Math.ceil(ALL_REELS.length / itemsPerPage);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleReels = useMemo(
    () => ALL_REELS.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [clampedPage, itemsPerPage]
  );

  return (
    <div className="reel-grid-component" ref={containerRef}>
      <div className="reel-grid-items">
        {visibleReels.map((reel) => (
          <div key={reel.id} className="reel-grid-card">
            <img src={reel.thumbnail} alt={reel.author} loading="lazy" />
            <div className="reel-grid-card-overlay">
              <span className="reel-grid-card-likes">♥ {reel.likes}</span>
              <span className="reel-grid-card-author">{reel.author}</span>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="reel-grid-pagination">
          <button disabled={clampedPage === 0} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>
          <span>
            {clampedPage + 1} / {totalPages}
          </span>
          <button disabled={clampedPage >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            ›
          </button>
        </div>
      )}
    </div>
  );
}
