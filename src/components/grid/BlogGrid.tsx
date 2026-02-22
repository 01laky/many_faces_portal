/**
 * BlogGrid - Paginated grid of blog post cards
 *
 * The number of visible items recalculates based on the container size.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './BlogGrid.scss';

const CARD_MIN_W = 180;
const CARD_MIN_H = 190;

interface BlogData {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  image: string;
}

function generatePosts(total: number): BlogData[] {
  const titles = [
    'Getting Started with React 19',
    'TypeScript Best Practices',
    'CSS Grid Deep Dive',
    'Building Accessible UIs',
    'Server Components Explained',
    'Testing Strategies for React',
    'State Management in 2025',
    'Performance Optimization Tips',
  ];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    title: titles[i % titles.length],
    date: `${(i % 28) + 1} Feb 2025`,
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.',
    image: `https://picsum.photos/seed/blog${i + 1}/400/250`,
  }));
}

const ALL_POSTS = generatePosts(36);

export function BlogGrid() {
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

  const totalPages = Math.ceil(ALL_POSTS.length / itemsPerPage);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visiblePosts = useMemo(
    () => ALL_POSTS.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [clampedPage, itemsPerPage]
  );

  return (
    <div className="blog-grid-component" ref={containerRef}>
      <div className="blog-grid-items">
        {visiblePosts.map((post) => (
          <div key={post.id} className="blog-grid-card">
            <img src={post.image} alt={post.title} loading="lazy" />
            <div className="blog-grid-card-info">
              <span className="blog-grid-card-date">{post.date}</span>
              <span className="blog-grid-card-title">{post.title}</span>
              <span className="blog-grid-card-excerpt">{post.excerpt}</span>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="blog-grid-pagination">
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
