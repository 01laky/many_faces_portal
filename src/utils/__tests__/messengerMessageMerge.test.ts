import { describe, expect, it } from 'vitest';
import {
  applyIncomingChatMessage,
  createOptimisticOutgoingMessage,
  removeOptimisticOutgoingMessages,
  type MessengerUiMessage,
} from '../messengerMessageMerge';

const SUPER_ADMIN = 'super-admin-id';
const CURRENT_USER = 'user-id';

function inbound(content: string, id: number): MessengerUiMessage {
  return {
    id,
    senderId: SUPER_ADMIN,
    senderName: 'Support',
    content,
    sentAt: '2026-01-01T12:00:00Z',
    readAt: null,
  };
}

describe('messengerMessageMerge', () => {
  it('applyIncomingChatMessage appends inbound message for open thread', () => {
    const next = applyIncomingChatMessage([], {
      selectedUserId: SUPER_ADMIN,
      currentUserId: CURRENT_USER,
      senderId: SUPER_ADMIN,
      senderName: 'Support',
      content: 'hello',
      sentAt: '2026-01-01T12:00:00Z',
      messageId: 10,
    });
    expect(next).toHaveLength(1);
    expect(next[0]?.content).toBe('hello');
  });

  it('applyIncomingChatMessage replaces optimistic row on own echo', () => {
    const optimistic = createOptimisticOutgoingMessage('my reply', -99);
    const next = applyIncomingChatMessage([optimistic], {
      selectedUserId: SUPER_ADMIN,
      currentUserId: CURRENT_USER,
      senderId: CURRENT_USER,
      senderName: 'Me',
      content: 'my reply',
      sentAt: '2026-01-01T12:01:00Z',
      messageId: 42,
    });
    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe(42);
    expect(next[0]?.senderId).toBe('me');
  });

  it('applyIncomingChatMessage does not duplicate when echo arrives before late optimistic', () => {
    const afterEcho = applyIncomingChatMessage([], {
      selectedUserId: SUPER_ADMIN,
      currentUserId: CURRENT_USER,
      senderId: CURRENT_USER,
      senderName: 'Me',
      content: 'race reply',
      sentAt: '2026-01-01T12:01:00Z',
      messageId: 7,
    });
    const withLateOptimistic = [...afterEcho, createOptimisticOutgoingMessage('race reply', -55)];
    const reconciled = applyIncomingChatMessage(withLateOptimistic, {
      selectedUserId: SUPER_ADMIN,
      currentUserId: CURRENT_USER,
      senderId: CURRENT_USER,
      senderName: 'Me',
      content: 'race reply',
      sentAt: '2026-01-01T12:01:00Z',
      messageId: 7,
    });
    expect(reconciled).toHaveLength(1);
    expect(reconciled[0]?.id).toBe(7);
  });

  it('applyIncomingChatMessage ignores unrelated sender when thread not selected', () => {
    const base = [inbound('seed', 1)];
    const next = applyIncomingChatMessage(base, {
      selectedUserId: null,
      currentUserId: CURRENT_USER,
      senderId: SUPER_ADMIN,
      senderName: 'Support',
      content: 'ignored',
      sentAt: '2026-01-01T12:02:00Z',
      messageId: 2,
    });
    expect(next).toEqual(base);
  });

  it('removeOptimisticOutgoingMessages strips pending outgoing rows', () => {
    const rows = [inbound('seed', 1), createOptimisticOutgoingMessage('pending', -3)];
    expect(removeOptimisticOutgoingMessages(rows)).toEqual([inbound('seed', 1)]);
  });
});
