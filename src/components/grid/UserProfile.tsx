/**
 * UserProfile - Single user profile card with avatar, name and bio
 *
 * Uses placeholder avatar. Layout adapts to container size.
 */

import './UserProfile.scss';

export function UserProfile() {
  return (
    <div className="userprofile-component">
      <img
        className="userprofile-avatar"
        src="https://picsum.photos/seed/user1/200/200"
        alt="User avatar"
        loading="lazy"
      />
      <div className="userprofile-info">
        <span className="userprofile-name">Jane Doe</span>
        <span className="userprofile-role">Software Engineer</span>
        <span className="userprofile-bio">
          Passionate about building great user experiences with React and TypeScript.
        </span>
      </div>
      <div className="userprofile-stats">
        <div className="userprofile-stat">
          <span className="userprofile-stat-value">142</span>
          <span className="userprofile-stat-label">Posts</span>
        </div>
        <div className="userprofile-stat">
          <span className="userprofile-stat-value">1.2k</span>
          <span className="userprofile-stat-label">Followers</span>
        </div>
        <div className="userprofile-stat">
          <span className="userprofile-stat-value">89</span>
          <span className="userprofile-stat-label">Following</span>
        </div>
      </div>
    </div>
  );
}
