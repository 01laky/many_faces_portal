/**
 * Ad - Single listing card with image, price and description
 *
 * Uses placeholder images. Layout adapts to container size.
 */

import './Ad.scss';

const PLACEHOLDER_IMG = 'https://picsum.photos/seed/ad1/600/400';

export function Ad() {
  return (
    <div className="ad-component">
      <img className="ad-photo" src={PLACEHOLDER_IMG} alt="Listing" loading="lazy" />
      <div className="ad-overlay">
        <span className="ad-price">€ 1 250</span>
        <span className="ad-title">Vintage Leather Sofa</span>
        <span className="ad-location">Bratislava</span>
      </div>
    </div>
  );
}
