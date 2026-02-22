/**
 * UserProfileCarousel - Paginated horizontal carousel of user profile cards
 *
 * The number of visible items recalculates based on container width.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './UserProfileCarousel.scss';

const CARD_WIDTH = 140;
const CARD_GAP = 8;

interface ProfileData {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

function generateProfiles(total: number): ProfileData[] {
  const names = [
    'Jane Doe',
    'John Smith',
    'Anna K.',
    'Peter M.',
    'Maria L.',
    'Tom H.',
    'Sara B.',
    'Mike W.',
  ];
  const roles = [
    'Developer',
    'Designer',
    'Manager',
    'Analyst',
    'Engineer',
    'Writer',
    'Photographer',
    'Teacher',
  ];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    role: roles[i % roles.length],
    avatar: `https://picsum.photos/seed/userC${i + 1}/100/100`,
  }));
}

const ALL_PROFILES = generateProfiles(24);

export function UserProfileCarousel() {
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

  const totalPages = Math.ceil(ALL_PROFILES.length / visibleCount);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleProfiles = useMemo(
    () => ALL_PROFILES.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [clampedPage, visibleCount]
  );

  return (
    <div className="userprofile-carousel-component" ref={containerRef}>
      <button
        className="userprofile-carousel-nav userprofile-carousel-prev"
        disabled={clampedPage === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        ‹
      </button>

      <div className="userprofile-carousel-track">
        {visibleProfiles.map((profile) => (
          <div key={profile.id} className="userprofile-carousel-card" style={{ width: CARD_WIDTH }}>
            <img
              className="userprofile-carousel-avatar"
              src={profile.avatar}
              alt={profile.name}
              loading="lazy"
            />
            <span className="userprofile-carousel-card-name">{profile.name}</span>
            <span className="userprofile-carousel-card-role">{profile.role}</span>
          </div>
        ))}
      </div>

      <button
        className="userprofile-carousel-nav userprofile-carousel-next"
        disabled={clampedPage >= totalPages - 1}
        onClick={() => setPage((p) => p + 1)}
      >
        ›
      </button>

      {totalPages > 1 && (
        <div className="userprofile-carousel-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`userprofile-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
