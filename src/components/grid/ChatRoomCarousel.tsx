/**
 * ChatRoomCarousel - Paginated horizontal carousel of chat room cards
 *
 * The number of visible items recalculates based on container width.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './ChatRoomCarousel.scss';

const CARD_WIDTH = 200;
const CARD_GAP = 8;

interface RoomData {
  id: number;
  name: string;
  members: number;
  online: number;
  avatar: string;
}

function generateRooms(total: number): RoomData[] {
  const names = [
    'General',
    'Tech Talk',
    'Music Fans',
    'Book Club',
    'Gamers Hub',
    'Foodies',
    'Travel',
    'Fitness',
  ];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    members: Math.floor(Math.random() * 300) + 10,
    online: Math.floor(Math.random() * 50) + 1,
    avatar: `https://picsum.photos/seed/roomC${i + 1}/100/100`,
  }));
}

const ALL_ROOMS = generateRooms(24);

export function ChatRoomCarousel() {
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

  const totalPages = Math.ceil(ALL_ROOMS.length / visibleCount);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleRooms = useMemo(
    () => ALL_ROOMS.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [clampedPage, visibleCount]
  );

  return (
    <div className="chatroom-carousel-component" ref={containerRef}>
      <button
        className="chatroom-carousel-nav chatroom-carousel-prev"
        disabled={clampedPage === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        ‹
      </button>

      <div className="chatroom-carousel-track">
        {visibleRooms.map((room) => (
          <div key={room.id} className="chatroom-carousel-card" style={{ width: CARD_WIDTH }}>
            <img
              className="chatroom-carousel-avatar"
              src={room.avatar}
              alt={room.name}
              loading="lazy"
            />
            <div className="chatroom-carousel-card-info">
              <span className="chatroom-carousel-card-name">{room.name}</span>
              <span className="chatroom-carousel-card-meta">
                {room.members} members • {room.online} online
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        className="chatroom-carousel-nav chatroom-carousel-next"
        disabled={clampedPage >= totalPages - 1}
        onClick={() => setPage((p) => p + 1)}
      >
        ›
      </button>

      {totalPages > 1 && (
        <div className="chatroom-carousel-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`chatroom-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
