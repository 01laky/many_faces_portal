/**
 * ReelCarousel - Paginated horizontal carousel of video reel cards
 *
 * The number of visible items recalculates based on container width.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './ReelCarousel.scss';

const CARD_WIDTH = 120;
const CARD_GAP = 6;

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
    thumbnail: `https://picsum.photos/seed/reelC${i + 1}/200/350`,
  }));
}

const ALL_REELS = generateReels(24);

export function ReelCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [page, setPage] = useState(0);

  const calcVisible = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth - 60;
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

  const totalPages = Math.ceil(ALL_REELS.length / visibleCount);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleReels = useMemo(
    () => ALL_REELS.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [clampedPage, visibleCount]
  );

  return (
    <div className="reel-carousel-component" ref={containerRef}>
      <button
        className="reel-carousel-nav reel-carousel-prev"
        disabled={clampedPage === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        ‹
      </button>

      <div className="reel-carousel-track">
        {visibleReels.map((reel) => (
          <div key={reel.id} className="reel-carousel-card" style={{ width: CARD_WIDTH }}>
            <img src={reel.thumbnail} alt={reel.author} loading="lazy" />
            <div className="reel-carousel-card-overlay">
              <span className="reel-carousel-card-likes">♥ {reel.likes}</span>
              <span className="reel-carousel-card-author">{reel.author}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        className="reel-carousel-nav reel-carousel-next"
        disabled={clampedPage >= totalPages - 1}
        onClick={() => setPage((p) => p + 1)}
      >
        ›
      </button>

      {totalPages > 1 && (
        <div className="reel-carousel-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`reel-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
