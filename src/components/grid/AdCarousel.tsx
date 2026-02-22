/**
 * AdCarousel - Paginated horizontal carousel of listing cards
 *
 * The number of visible items recalculates based on container width.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './AdCarousel.scss';

const CARD_WIDTH = 160;
const CARD_GAP = 8;

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
  ];
  const locations = ['Bratislava', 'Košice', 'Žilina', 'Prešov'];
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    title: titles[i % titles.length],
    price: `€ ${Math.floor(Math.random() * 500) + 10}`,
    location: locations[i % locations.length],
    image: `https://picsum.photos/seed/adC${i + 1}/300/300`,
  }));
}

const ALL_ADS = generateAds(30);

export function AdCarousel() {
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

  const totalPages = Math.ceil(ALL_ADS.length / visibleCount);
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleAds = useMemo(
    () => ALL_ADS.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [clampedPage, visibleCount]
  );

  return (
    <div className="ad-carousel-component" ref={containerRef}>
      <button
        className="ad-carousel-nav ad-carousel-prev"
        disabled={clampedPage === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        ‹
      </button>

      <div className="ad-carousel-track">
        {visibleAds.map((ad) => (
          <div key={ad.id} className="ad-carousel-card" style={{ width: CARD_WIDTH }}>
            <img src={ad.image} alt={ad.title} loading="lazy" />
            <div className="ad-carousel-card-info">
              <span className="ad-carousel-card-price">{ad.price}</span>
              <span className="ad-carousel-card-title">{ad.title}</span>
              <span className="ad-carousel-card-location">{ad.location}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        className="ad-carousel-nav ad-carousel-next"
        disabled={clampedPage >= totalPages - 1}
        onClick={() => setPage((p) => p + 1)}
      >
        ›
      </button>

      {totalPages > 1 && (
        <div className="ad-carousel-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`ad-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
