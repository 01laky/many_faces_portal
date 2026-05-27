import type { ConversationItem } from '@/api/services/MessagesService';

/** Patch conversation list preview on inbound chat without full REST refetch (PT-RP3). */
export function patchConversationOnInboundMessage(
	conversations: ConversationItem[],
	options: {
		senderId: string;
		senderName: string;
		content: string;
		sentAt: string;
		currentUserId: string;
		threadOpen: boolean;
	}
): ConversationItem[] {
	const { senderId, senderName, content, sentAt, currentUserId, threadOpen } = options;
	const existing = conversations.find((c) => c.otherUserId === senderId);
	const isFromMe = senderId === currentUserId;
	if (existing) {
		const updated: ConversationItem = {
			...existing,
			otherUserName: existing.otherUserName || senderName,
			lastMessage: content,
			lastMessageAt: sentAt,
			lastMessageFromMe: isFromMe,
			unreadCount: threadOpen ? 0 : existing.unreadCount + (isFromMe ? 0 : 1),
		};
		const rest = conversations.filter((c) => c.otherUserId !== senderId);
		return [updated, ...rest];
	}
	return [
		{
			otherUserId: senderId,
			otherUserName: senderName,
			otherUserEmail: null,
			lastMessage: content,
			lastMessageAt: sentAt,
			lastMessageFromMe: isFromMe,
			unreadCount: threadOpen || isFromMe ? 0 : 1,
		},
		...conversations,
	];
}

/** Patch conversation preview after optimistic send (PT-RP3). */
export function patchConversationOnOutgoingMessage(
	conversations: ConversationItem[],
	options: {
		receiverId: string;
		receiverName: string;
		content: string;
		sentAt: string;
	}
): ConversationItem[] {
	const { receiverId, receiverName, content, sentAt } = options;
	const existing = conversations.find((c) => c.otherUserId === receiverId);
	if (existing) {
		const updated: ConversationItem = {
			...existing,
			lastMessage: content,
			lastMessageAt: sentAt,
			lastMessageFromMe: true,
		};
		const rest = conversations.filter((c) => c.otherUserId !== receiverId);
		return [updated, ...rest];
	}
	return [
		{
			otherUserId: receiverId,
			otherUserName: receiverName,
			otherUserEmail: null,
			lastMessage: content,
			lastMessageAt: sentAt,
			lastMessageFromMe: true,
			unreadCount: 0,
		},
		...conversations,
	];
}

/** Merge accepted message request into conversations locally (PT-RP3). */
export function mergeAcceptedMessageRequest(
	conversations: ConversationItem[],
	request: { senderId: string; senderName: string; lastMessage: string; lastMessageAt: string }
): ConversationItem[] {
	if (conversations.some((c) => c.otherUserId === request.senderId)) {
		return conversations;
	}
	return [
		{
			otherUserId: request.senderId,
			otherUserName: request.senderName,
			otherUserEmail: null,
			lastMessage: request.lastMessage,
			lastMessageAt: request.lastMessageAt,
			lastMessageFromMe: false,
			unreadCount: 0,
		},
		...conversations,
	];
}
