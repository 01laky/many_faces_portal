/**
 * StoryGrid - Paginated grid of story circles
 *
 * The number of visible items recalculates based on the container size.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './StoryGrid.scss';

const CARD_MIN_W = 90;
const CARD_MIN_H = 110;

interface StoryData {
  id: number;
  username: string;
  avatar: string;
  seen: boolean;
}

function generateStories(total: number): StoryData[] {
  const names = [
    'jane_d',
    'john_s',
    'anna_k',
    'peter_m',
    'maria_l',
    'tom_h',
    'sara_b',
    'mike_w',
    'eva_n',
    'david_r',
    'lucia_p',
    'martin_c',
  ];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    username: names[i % names.length],
    avatar: `https://picsum.photos/seed/story${i + 1}/100/100`,
    seen: i % 3 === 0,
  }));
}

const ALL_STORIES = generateStories(48);

export function StoryGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(8);
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

  const totalPages = Math.ceil(ALL_STORIES.length / itemsPerPage);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleStories = useMemo(
    () => ALL_STORIES.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [clampedPage, itemsPerPage]
  );

  return (
    <div className="story-grid-component" ref={containerRef}>
      <div className="story-grid-items">
        {visibleStories.map((story) => (
          <div key={story.id} className="story-grid-card">
            <div className={`story-grid-ring ${story.seen ? 'seen' : ''}`}>
              <img src={story.avatar} alt={story.username} loading="lazy" />
            </div>
            <span className="story-grid-card-name">{story.username}</span>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="story-grid-pagination">
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
