/**
 * UserProfileGrid - Paginated grid of user profile cards
 *
 * The number of visible items recalculates based on the container size.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './UserProfileGrid.scss';

const CARD_MIN_W = 140;
const CARD_MIN_H = 120;

interface ProfileData {
  id: number;
  name: string;
  role: string;
  avatar: string;
  posts: number;
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
    'Eva N.',
    'David R.',
    'Lucia P.',
    'Martin C.',
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
    avatar: `https://picsum.photos/seed/user${i + 1}/100/100`,
    posts: Math.floor(Math.random() * 200) + 1,
  }));
}

const ALL_PROFILES = generateProfiles(48);

export function UserProfileGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(6);
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

  const totalPages = Math.ceil(ALL_PROFILES.length / itemsPerPage);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleProfiles = useMemo(
    () => ALL_PROFILES.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [clampedPage, itemsPerPage]
  );

  return (
    <div className="userprofile-grid-component" ref={containerRef}>
      <div className="userprofile-grid-items">
        {visibleProfiles.map((profile) => (
          <div key={profile.id} className="userprofile-grid-card">
            <img
              className="userprofile-grid-avatar"
              src={profile.avatar}
              alt={profile.name}
              loading="lazy"
            />
            <span className="userprofile-grid-card-name">{profile.name}</span>
            <span className="userprofile-grid-card-role">{profile.role}</span>
            <span className="userprofile-grid-card-posts">{profile.posts} posts</span>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="userprofile-grid-pagination">
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
