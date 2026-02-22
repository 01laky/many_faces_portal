/**
 * ChatRoom - Single chat room card with room name, member count and last message
 *
 * Uses placeholder avatars. Layout adapts to container size.
 */

import './ChatRoom.scss';

export function ChatRoom() {
  return (
    <div className="chatroom-component">
      <div className="chatroom-header">
        <div className="chatroom-avatar">
          <img src="https://picsum.photos/seed/room1/100/100" alt="Room" loading="lazy" />
        </div>
        <div className="chatroom-info">
          <span className="chatroom-name">General Discussion</span>
          <span className="chatroom-members">128 members • 24 online</span>
        </div>
      </div>
      <div className="chatroom-messages">
        <div className="chatroom-msg">
          <span className="chatroom-msg-author">John D.</span>
          <span className="chatroom-msg-text">Hey everyone! Has anyone tried the new feature?</span>
        </div>
        <div className="chatroom-msg">
          <span className="chatroom-msg-author">Anna K.</span>
          <span className="chatroom-msg-text">Yes, it's really cool! 🎉</span>
        </div>
        <div className="chatroom-msg">
          <span className="chatroom-msg-author">Peter M.</span>
          <span className="chatroom-msg-text">I'll check it out later today</span>
        </div>
      </div>
    </div>
  );
}
