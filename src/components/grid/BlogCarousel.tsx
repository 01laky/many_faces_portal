/**
 * BlogCarousel - Paginated horizontal carousel of blog post cards
 *
 * The number of visible items recalculates based on container width.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './BlogCarousel.scss';

const CARD_WIDTH = 200;
const CARD_GAP = 8;

interface BlogData {
  id: number;
  title: string;
  date: string;
  image: string;
}

function generatePosts(total: number): BlogData[] {
  const titles = [
    'Getting Started with React 19',
    'TypeScript Best Practices',
    'CSS Grid Deep Dive',
    'Building Accessible UIs',
    'Server Components Explained',
    'Testing Strategies',
  ];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    title: titles[i % titles.length],
    date: `${(i % 28) + 1} Feb 2025`,
    image: `https://picsum.photos/seed/blogC${i + 1}/400/250`,
  }));
}

const ALL_POSTS = generatePosts(24);

export function BlogCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(2);
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

  const totalPages = Math.ceil(ALL_POSTS.length / visibleCount);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visiblePosts = useMemo(
    () => ALL_POSTS.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [clampedPage, visibleCount]
  );

  return (
    <div className="blog-carousel-component" ref={containerRef}>
      <button
        className="blog-carousel-nav blog-carousel-prev"
        disabled={clampedPage === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        ‹
      </button>

      <div className="blog-carousel-track">
        {visiblePosts.map((post) => (
          <div key={post.id} className="blog-carousel-card" style={{ width: CARD_WIDTH }}>
            <img src={post.image} alt={post.title} loading="lazy" />
            <div className="blog-carousel-card-info">
              <span className="blog-carousel-card-date">{post.date}</span>
              <span className="blog-carousel-card-title">{post.title}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        className="blog-carousel-nav blog-carousel-next"
        disabled={clampedPage >= totalPages - 1}
        onClick={() => setPage((p) => p + 1)}
      >
        ›
      </button>

      {totalPages > 1 && (
        <div className="blog-carousel-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`blog-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
