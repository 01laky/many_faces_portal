/**
 * AdGrid - Paginated grid of listing cards
 *
 * The number of visible items recalculates based on the container size.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './AdGrid.scss';

const CARD_MIN_W = 150;
const CARD_MIN_H = 180;

interface AdData {
  id: number;
  title: string;
  price: string;
  location: string;
  image: string;
}

function generateAds(total: number): AdData[] {
  const titles = [
    'Vintage Sofa',
    'Mountain Bike',
    'iPhone 15',
    'Dining Table',
    'Gaming Chair',
    'Bookshelf',
    'Electric Scooter',
    'Coffee Machine',
    'Desk Lamp',
    'Winter Jacket',
    'Running Shoes',
    'Camera Lens',
  ];
  const locations = ['Bratislava', 'Košice', 'Žilina', 'Prešov', 'Banská Bystrica'];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    title: titles[i % titles.length],
    price: `€ ${Math.floor(Math.random() * 500) + 10}`,
    location: locations[i % locations.length],
    image: `https://picsum.photos/seed/ad${i + 1}/300/300`,
  }));
}

const ALL_ADS = generateAds(48);

export function AdGrid() {
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

  const totalPages = Math.ceil(ALL_ADS.length / itemsPerPage);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleAds = useMemo(
    () => ALL_ADS.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [clampedPage, itemsPerPage]
  );

  return (
    <div className="ad-grid-component" ref={containerRef}>
      <div className="ad-grid-items">
        {visibleAds.map((ad) => (
          <div key={ad.id} className="ad-grid-card">
            <img src={ad.image} alt={ad.title} loading="lazy" />
            <div className="ad-grid-card-info">
              <span className="ad-grid-card-price">{ad.price}</span>
              <span className="ad-grid-card-title">{ad.title}</span>
              <span className="ad-grid-card-location">{ad.location}</span>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="ad-grid-pagination">
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
