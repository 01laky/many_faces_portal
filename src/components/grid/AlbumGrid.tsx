/**
 * AlbumGrid - Paginated grid of album cards
 *
 * The number of visible items recalculates based on the container size.
 * Uses a ref-based resize observer to measure the container.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './AlbumGrid.scss';

const ALBUM_CARD_MIN_W = 140;
const ALBUM_CARD_MIN_H = 160;

interface AlbumData {
  id: number;
  title: string;
  cover: string;
  count: number;
}

function generateAlbums(total: number): AlbumData[] {
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    title: `Album ${i + 1}`,
    cover: `https://picsum.photos/seed/album${i + 1}/300/300`,
    count: Math.floor(Math.random() * 50) + 5,
  }));
}

const ALL_ALBUMS = generateAlbums(48);

export function AlbumGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [page, setPage] = useState(0);

  const calcItems = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const headerHeight = 36;
    const paginationHeight = 32;
    const availH = clientHeight - headerHeight - paginationHeight;
    const cols = Math.max(1, Math.floor(clientWidth / ALBUM_CARD_MIN_W));
    const rows = Math.max(1, Math.floor(availH / ALBUM_CARD_MIN_H));
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

  const totalPages = Math.ceil(ALL_ALBUMS.length / itemsPerPage);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleAlbums = useMemo(
    () => ALL_ALBUMS.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [clampedPage, itemsPerPage]
  );

  return (
    <div className="album-grid-component" ref={containerRef}>
      <div className="album-grid-items">
        {visibleAlbums.map((album) => (
          <div key={album.id} className="album-grid-card">
            <img src={album.cover} alt={album.title} loading="lazy" />
            <div className="album-grid-card-info">
              <span className="album-grid-card-title">{album.title}</span>
              <span className="album-grid-card-count">{album.count} photos</span>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="album-grid-pagination">
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
