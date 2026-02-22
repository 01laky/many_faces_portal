/**
 * Story - Single story circle with user avatar, ring border and name
 *
 * Uses placeholder avatar. Displays like an Instagram story bubble.
 */

import './Story.scss';

export function Story() {
  return (
    <div className="story-component">
      <div className="story-ring">
        <img
          className="story-avatar"
          src="https://picsum.photos/seed/story1/200/200"
          alt="Story"
          loading="lazy"
        />
      </div>
      <span className="story-username">jane_doe</span>
      <span className="story-time">2h ago</span>
    </div>
  );
}
