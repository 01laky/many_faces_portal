/**
 * ChatRoomGrid - Paginated grid of chat room cards
 *
 * The number of visible items recalculates based on the container size.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './ChatRoomGrid.scss';

const CARD_MIN_W = 180;
const CARD_MIN_H = 100;

interface RoomData {
  id: number;
  name: string;
  members: number;
  online: number;
  lastMessage: string;
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
    'Photography',
    'Movie Night',
    'Study Group',
    'Pets',
  ];
  const messages = [
    'Hey everyone!',
    'Anyone online?',
    'Check this out!',
    'Great idea 👍',
    'See you tomorrow',
    'LOL 😂',
  ];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    members: Math.floor(Math.random() * 300) + 10,
    online: Math.floor(Math.random() * 50) + 1,
    lastMessage: messages[i % messages.length],
    avatar: `https://picsum.photos/seed/room${i + 1}/100/100`,
  }));
}

const ALL_ROOMS = generateRooms(36);

export function ChatRoomGrid() {
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

  const totalPages = Math.ceil(ALL_ROOMS.length / itemsPerPage);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleRooms = useMemo(
    () => ALL_ROOMS.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [clampedPage, itemsPerPage]
  );

  return (
    <div className="chatroom-grid-component" ref={containerRef}>
      <div className="chatroom-grid-items">
        {visibleRooms.map((room) => (
          <div key={room.id} className="chatroom-grid-card">
            <img
              className="chatroom-grid-avatar"
              src={room.avatar}
              alt={room.name}
              loading="lazy"
            />
            <div className="chatroom-grid-card-info">
              <span className="chatroom-grid-card-name">{room.name}</span>
              <span className="chatroom-grid-card-meta">
                {room.members} members • {room.online} online
              </span>
              <span className="chatroom-grid-card-msg">{room.lastMessage}</span>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="chatroom-grid-pagination">
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
