import { authAwareFetch } from '../utils/authAwareFetch';
import { absoluteScopedUrl } from '../faceApiRouting';

async function apiFetch(path: string, options: RequestInit & { token?: string }) {
	const token = options.token;
	delete (options as Record<string, unknown>).token;
	const url = absoluteScopedUrl(path);
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...((options.headers as Record<string, string>) ?? {}),
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return authAwareFetch(url, { ...options, headers, token: token ?? undefined });
}

export interface ConversationItem {
	otherUserId: string;
	otherUserName: string;
	otherUserEmail: string | null;
	lastMessage: string;
	lastMessageAt: string;
	lastMessageFromMe: boolean;
	unreadCount: number;
}

export interface MessageRequestItem {
	senderId: string;
	senderName: string;
	senderEmail: string | null;
	lastMessage: string;
	lastMessageAt: string;
	count: number;
}

export interface MessageItem {
	id: number;
	senderId: string;
	senderName: string;
	content: string;
	sentAt: string;
	readAt: string | null;
}

export async function getConversations(token: string): Promise<ConversationItem[]> {
	const res = await apiFetch('/api/Messages/conversations', { method: 'GET', token });
	if (!res.ok) throw new Error('Failed to fetch conversations');
	return res.json();
}

export async function getMessageRequests(token: string): Promise<MessageRequestItem[]> {
	const res = await apiFetch('/api/Messages/requests', { method: 'GET', token });
	if (!res.ok) throw new Error('Failed to fetch message requests');
	return res.json();
}

export async function getMessagesWith(
	otherUserId: string,
	token: string,
	limit = 50
): Promise<MessageItem[]> {
	const res = await apiFetch(
		`/api/Messages/with/${encodeURIComponent(otherUserId)}?limit=${limit}`,
		{ method: 'GET', token }
	);
	if (!res.ok) throw new Error('Failed to fetch messages');
	return res.json();
}

export async function markMessagesAsRead(otherUserId: string, token: string): Promise<void> {
	const res = await apiFetch(`/api/Messages/with/${encodeURIComponent(otherUserId)}/read`, {
		method: 'POST',
		token,
	});
	if (!res.ok) throw new Error('Failed to mark as read');
}
