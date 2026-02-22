/**
 * Album - Main preview photo with 3 small thumbnails in the bottom-right corner
 *
 * Uses placeholder images. Layout adapts to container size.
 */

import './Album.scss';

const PLACEHOLDER_MAIN = 'https://picsum.photos/seed/main/600/400';
const PLACEHOLDER_THUMBS = [
  'https://picsum.photos/seed/t1/150/150',
  'https://picsum.photos/seed/t2/150/150',
  'https://picsum.photos/seed/t3/150/150',
];

export function Album() {
  return (
    <div className="album-component">
      <img className="album-main-photo" src={PLACEHOLDER_MAIN} alt="Album cover" loading="lazy" />
      <div className="album-thumbnails">
        {PLACEHOLDER_THUMBS.map((src, i) => (
          <img
            key={i}
            className="album-thumb"
            src={src}
            alt={`Thumbnail ${i + 1}`}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
