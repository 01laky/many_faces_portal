/**
 * Reel - Single vertical video reel with play overlay and engagement stats
 *
 * Uses placeholder image. Styled as a vertical phone-ratio video card.
 */

import './Reel.scss';

export function Reel() {
  return (
    <div className="reel-component">
      <img
        className="reel-video"
        src="https://picsum.photos/seed/reel1/400/700"
        alt="Reel"
        loading="lazy"
      />
      <div className="reel-play-overlay">▶</div>
      <div className="reel-overlay">
        <div className="reel-engagement">
          <span className="reel-stat">♥ 2.4k</span>
          <span className="reel-stat">💬 128</span>
          <span className="reel-stat">↗ 56</span>
        </div>
        <div className="reel-author">
          <img
            className="reel-author-avatar"
            src="https://picsum.photos/seed/reelUser1/50/50"
            alt="Author"
            loading="lazy"
          />
          <span className="reel-author-name">@creative_jane</span>
        </div>
      </div>
    </div>
  );
}
