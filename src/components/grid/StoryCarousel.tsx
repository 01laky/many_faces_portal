/**
 * StoryCarousel - Paginated horizontal carousel of story circles
 *
 * The number of visible items recalculates based on container width.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './StoryCarousel.scss';

const CARD_WIDTH = 76;
const CARD_GAP = 10;

interface StoryData {
  id: number;
  username: string;
  avatar: string;
  seen: boolean;
}

function generateStories(total: number): StoryData[] {
  const names = ['jane_d', 'john_s', 'anna_k', 'peter_m', 'maria_l', 'tom_h', 'sara_b', 'mike_w'];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    username: names[i % names.length],
    avatar: `https://picsum.photos/seed/storyC${i + 1}/100/100`,
    seen: i % 4 === 0,
  }));
}

const ALL_STORIES = generateStories(24);

export function StoryCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(4);
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

  const totalPages = Math.ceil(ALL_STORIES.length / visibleCount);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleStories = useMemo(
    () => ALL_STORIES.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [clampedPage, visibleCount]
  );

  return (
    <div className="story-carousel-component" ref={containerRef}>
      <button
        className="story-carousel-nav story-carousel-prev"
        disabled={clampedPage === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        ‹
      </button>

      <div className="story-carousel-track">
        {visibleStories.map((story) => (
          <div key={story.id} className="story-carousel-card" style={{ width: CARD_WIDTH }}>
            <div className={`story-carousel-ring ${story.seen ? 'seen' : ''}`}>
              <img src={story.avatar} alt={story.username} loading="lazy" />
            </div>
            <span className="story-carousel-card-name">{story.username}</span>
          </div>
        ))}
      </div>

      <button
        className="story-carousel-nav story-carousel-next"
        disabled={clampedPage >= totalPages - 1}
        onClick={() => setPage((p) => p + 1)}
      >
        ›
      </button>

      {totalPages > 1 && (
        <div className="story-carousel-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`story-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
