import { describe, it, expect } from 'vitest';
import {
	mergeAcceptedMessageRequest,
	patchConversationOnInboundMessage,
	patchConversationOnOutgoingMessage,
} from '@/utils/messengerConversationMerge';
import type { ConversationItem } from '@/api/services/MessagesService';

const alice: ConversationItem = {
	otherUserId: 'user-2',
	otherUserName: 'Alice',
	otherUserEmail: null,
	lastMessage: 'Hi',
	lastMessageAt: '2026-01-01T10:00:00Z',
	lastMessageFromMe: false,
	unreadCount: 1,
};

describe('messengerConversationMerge (PT-RP3)', () => {
	it('PT-RP3-U1: inbound while thread open — preview updates, unread stays 0', () => {
		const next = patchConversationOnInboundMessage([alice], {
			senderId: 'user-2',
			senderName: 'Alice',
			content: 'Open thread msg',
			sentAt: '2026-01-01T10:05:00Z',
			currentUserId: 'me',
			threadOpen: true,
		});
		expect(next[0].lastMessage).toBe('Open thread msg');
		expect(next[0].unreadCount).toBe(0);
	});

	it('PT-RP3-U2: inbound while thread closed — bumps unread and moves to top', () => {
		const bob: ConversationItem = {
			...alice,
			otherUserId: 'user-3',
			otherUserName: 'Bob',
		};
		const next = patchConversationOnInboundMessage([alice, bob], {
			senderId: 'user-2',
			senderName: 'Alice',
			content: 'Ping',
			sentAt: '2026-01-01T11:00:00Z',
			currentUserId: 'me',
			threadOpen: false,
		});
		expect(next[0].otherUserId).toBe('user-2');
		expect(next[0].unreadCount).toBe(2);
		expect(next[1].otherUserId).toBe('user-3');
	});

	it('PT-RP3-U3: accepted message request merges new row when missing', () => {
		const next = mergeAcceptedMessageRequest([], {
			senderId: 'user-9',
			senderName: 'New Friend',
			lastMessage: 'Hey',
			lastMessageAt: '2026-01-01T12:00:00Z',
		});
		expect(next).toHaveLength(1);
		expect(next[0].otherUserId).toBe('user-9');
	});

	it('PT-RP3-U3b: accepted request does not duplicate existing row', () => {
		const next = mergeAcceptedMessageRequest([alice], {
			senderId: 'user-2',
			senderName: 'Alice',
			lastMessage: 'Req',
			lastMessageAt: '2026-01-01T09:00:00Z',
		});
		expect(next).toHaveLength(1);
	});

	it('PT-RP3-U4: outgoing preview marks lastMessageFromMe without duplicating rows', () => {
		const next = patchConversationOnOutgoingMessage([alice], {
			receiverId: 'user-2',
			receiverName: 'Alice',
			content: 'My reply',
			sentAt: '2026-01-01T10:06:00Z',
		});
		expect(next).toHaveLength(1);
		expect(next[0].lastMessageFromMe).toBe(true);
	});

	it('PT-RP3-U4b: outgoing to new receiver creates conversation row', () => {
		const next = patchConversationOnOutgoingMessage([], {
			receiverId: 'user-5',
			receiverName: 'Eve',
			content: 'First',
			sentAt: '2026-01-01T10:07:00Z',
		});
		expect(next[0].otherUserId).toBe('user-5');
		expect(next[0].unreadCount).toBe(0);
	});

	it('PT-RP3-U5: own-message echo does not increment unread', () => {
		const next = patchConversationOnInboundMessage([alice], {
			senderId: 'me',
			senderName: 'Me',
			content: 'Echo',
			sentAt: '2026-01-01T10:08:00Z',
			currentUserId: 'me',
			threadOpen: false,
		});
		expect(next[0].lastMessageFromMe).toBe(true);
		expect(next[0].unreadCount).toBe(0);
	});

	it('updates existing message request preview in place', () => {
		const next = patchConversationOnInboundMessage([], {
			senderId: 'user-9',
			senderName: 'Bob',
			content: 'First req',
			sentAt: '2026-01-01T11:00:00Z',
			currentUserId: 'me',
			threadOpen: false,
		});
		expect(next[0].lastMessage).toBe('First req');
	});
});
