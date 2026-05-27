import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Send, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
	getConversations,
	getMessageRequests,
	getMessagesWith,
	markMessagesAsRead,
	type ConversationItem,
	type MessageRequestItem,
	type MessageItem,
} from '../../api/services/MessagesService';
import { useMessenger } from '../../contexts/MessengerContext';
import {
	applyIncomingChatMessage,
	createOptimisticOutgoingMessage,
	removeOptimisticOutgoingMessages,
} from '../../utils/messengerMessageMerge';
import {
	mergeAcceptedMessageRequest,
	patchConversationOnInboundMessage,
	patchConversationOnOutgoingMessage,
} from '../../utils/messengerConversationMerge';
import { formatMessageTime } from '../../utils/formatMessageTime';
import { useAuth } from '../../contexts/AuthContext';
import { SimpleVirtualList } from '../SimpleVirtualList/SimpleVirtualList';
import './MessengerTab.scss';
import type { View } from './types';

export function MessengerTab({ token }: { token: string }) {
	const { t } = useTranslation('common');
	const { user } = useAuth();
	const {
		connectionState,
		sendMessage,
		acceptMessageRequest,
		rejectMessageRequest,
		onChatMessage,
		onMessageRequest,
		onMessageRequestAccepted,
		onMessageRequestRejected,
		onPlatformChatError,
	} = useMessenger();

	const [conversations, setConversations] = useState<ConversationItem[]>([]);
	const [messageRequests, setMessageRequests] = useState<MessageRequestItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [view, setView] = useState<View>('none');
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [selectedUserName, setSelectedUserName] = useState<string>('');
	const [messages, setMessages] = useState<MessageItem[]>([]);
	const [messagesLoading, setMessagesLoading] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [sending, setSending] = useState(false);
	const [actioningRequest, setActioningRequest] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const hadConnectedRef = useRef(false);

	const loadData = useCallback(async () => {
		await Promise.resolve();
		try {
			setLoading(true);
			const [convos, reqs] = await Promise.all([
				getConversations(token),
				getMessageRequests(token),
			]);
			setConversations(convos);
			setMessageRequests(reqs);
		} catch {
			toast.error(t('messenger.loadError'));
		} finally {
			setLoading(false);
		}
	}, [token, t]);

	useEffect(() => {
		queueMicrotask(() => void loadData());
	}, [loadData]);

	useEffect(() => {
		if (connectionState === 'Connected' && hadConnectedRef.current) {
			void loadData();
		}
		if (connectionState === 'Connected') {
			hadConnectedRef.current = true;
		}
	}, [connectionState, loadData]);

	const currentUserId = user?.id ?? '';

	useEffect(() => {
		const unsubChat = onChatMessage((senderId, _senderName, content, sentAt, messageId) => {
			setMessages((prev) =>
				applyIncomingChatMessage(prev, {
					selectedUserId,
					currentUserId,
					senderId,
					senderName: _senderName,
					content,
					sentAt,
					messageId,
				})
			);
			setConversations((prev) =>
				patchConversationOnInboundMessage(prev, {
					senderId,
					senderName: _senderName,
					content,
					sentAt,
					currentUserId,
					threadOpen: selectedUserId === senderId,
				})
			);
			if (selectedUserId === senderId) markMessagesAsRead(senderId, token).catch(() => {});
		});
		const unsubReq = onMessageRequest((senderId, senderName, content, sentAt) => {
			setMessageRequests((prev) => {
				const exists = prev.some((r) => r.senderId === senderId);
				if (exists) {
					return prev.map((r) =>
						r.senderId === senderId
							? {
									...r,
									lastMessage: content,
									lastMessageAt: sentAt,
									count: r.count + 1,
								}
							: r
					);
				}
				return [
					{
						senderId,
						senderName,
						senderEmail: null,
						lastMessage: content,
						lastMessageAt: sentAt,
						count: 1,
					},
					...prev,
				];
			});
		});
		const unsubAccept = onMessageRequestAccepted((accepterId, accepterName) => {
			setMessageRequests((prev) => {
				const req = prev.find((r) => r.senderId === accepterId);
				setConversations((convs) =>
					mergeAcceptedMessageRequest(convs, {
						senderId: accepterId,
						senderName: req?.senderName ?? accepterName,
						lastMessage: req?.lastMessage ?? '',
						lastMessageAt: req?.lastMessageAt ?? new Date().toISOString(),
					})
				);
				return prev.filter((r) => r.senderId !== accepterId);
			});
			if (selectedUserId) {
				setView('chat');
				setMessagesLoading(true);
				getMessagesWith(selectedUserId, token)
					.then(setMessages)
					.finally(() => setMessagesLoading(false));
			}
		});
		const unsubReject = onMessageRequestRejected((rejecterId) => {
			setMessageRequests((prev) => prev.filter((r) => r.senderId !== rejecterId));
			if (selectedUserId === rejecterId) {
				setView('none');
				setSelectedUserId(null);
			}
		});
		const unsubPlatformError = onPlatformChatError(() => {
			setMessages((prev) => removeOptimisticOutgoingMessages(prev));
			toast.error(t('messenger.sendError'));
		});
		return () => {
			unsubChat();
			unsubReq();
			unsubAccept();
			unsubReject();
			unsubPlatformError();
		};
	}, [
		onChatMessage,
		onMessageRequest,
		onMessageRequestAccepted,
		onMessageRequestRejected,
		onPlatformChatError,
		selectedUserId,
		currentUserId,
		token,
		t,
	]);

	const openConversation = useCallback(
		(otherUserId: string, otherUserName: string) => {
			setSelectedUserId(otherUserId);
			setSelectedUserName(otherUserName);
			setView('chat');
			setMessagesLoading(true);
			setMessages([]);
			getMessagesWith(otherUserId, token)
				.then((msgs) => {
					setMessages(msgs);
					markMessagesAsRead(otherUserId, token).catch(() => {});
				})
				.finally(() => setMessagesLoading(false));
			setTimeout(() => inputRef.current?.focus(), 100);
		},
		[token]
	);

	const openMessageRequest = useCallback((req: MessageRequestItem) => {
		setSelectedUserId(req.senderId);
		setSelectedUserName(req.senderName);
		setView('request');
	}, []);

	const handleAcceptRequest = useCallback(
		async (senderId: string) => {
			try {
				setActioningRequest(senderId);
				await acceptMessageRequest(senderId);
				setMessageRequests((prev) => prev.filter((r) => r.senderId !== senderId));
				toast.success(t('messenger.requestAccepted'));
				openConversation(
					senderId,
					messageRequests.find((r) => r.senderId === senderId)?.senderName || ''
				);
			} catch {
				toast.error(t('messenger.requestAcceptError'));
			} finally {
				setActioningRequest(null);
			}
		},
		[acceptMessageRequest, messageRequests, openConversation, t]
	);

	const handleRejectRequest = useCallback(
		async (senderId: string) => {
			try {
				setActioningRequest(senderId);
				await rejectMessageRequest(senderId);
				setMessageRequests((prev) => prev.filter((r) => r.senderId !== senderId));
				if (selectedUserId === senderId) {
					setView('none');
					setSelectedUserId(null);
				}
				toast.success(t('messenger.requestRejected'));
			} catch {
				toast.error(t('messenger.requestRejectError'));
			} finally {
				setActioningRequest(null);
			}
		},
		[rejectMessageRequest, selectedUserId, t]
	);

	const handleSend = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = inputValue.trim();
			if (!selectedUserId || !trimmed || sending) return;

			const optimisticId = -Date.now();
			setInputValue('');
			setMessages((prev) => [...prev, createOptimisticOutgoingMessage(trimmed, optimisticId)]);

			const sentAt = new Date().toISOString();
			try {
				setSending(true);
				await sendMessage(selectedUserId, trimmed);
				setConversations((prev) =>
					patchConversationOnOutgoingMessage(prev, {
						receiverId: selectedUserId,
						receiverName: selectedUserName,
						content: trimmed,
						sentAt,
					})
				);
			} catch {
				setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
				toast.error(t('messenger.sendError'));
			} finally {
				setSending(false);
			}
		},
		[selectedUserId, selectedUserName, inputValue, sending, sendMessage, t]
	);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	return (
		<div className="messenger-tab">
			<div className="messenger-main">
				<div className="messenger-chat-area">
					{view === 'none' ? (
						<div className="messenger-empty">
							<MessageCircle size={48} className="messenger-empty-icon" />
							<p>{t('messenger.selectConversation')}</p>
						</div>
					) : view === 'request' && selectedUserId ? (
						<div className="messenger-request-view">
							<div className="messenger-request-header">
								<h3>{selectedUserName}</h3>
								<span className="messenger-request-badge">{t('messenger.messageRequest')}</span>
							</div>
							<div className="messenger-request-actions">
								<button
									type="button"
									className="messenger-btn messenger-btn--accept"
									onClick={() => handleAcceptRequest(selectedUserId)}
									disabled={actioningRequest !== null}
								>
									{actioningRequest === selectedUserId ? (
										<Loader2 size={18} className="spin" />
									) : (
										<Check size={18} />
									)}
									<span>{t('messenger.accept')}</span>
								</button>
								<button
									type="button"
									className="messenger-btn messenger-btn--reject"
									onClick={() => handleRejectRequest(selectedUserId)}
									disabled={actioningRequest !== null}
								>
									<X size={18} />
									<span>{t('messenger.reject')}</span>
								</button>
							</div>
							{messageRequests.find((r) => r.senderId === selectedUserId) && (
								<p className="messenger-request-preview">
									{messageRequests.find((r) => r.senderId === selectedUserId)?.lastMessage}
								</p>
							)}
						</div>
					) : view === 'chat' && selectedUserId ? (
						<>
							<div className="messenger-chat-header">
								<h3>{selectedUserName}</h3>
								<span
									className={`messenger-status messenger-status--${connectionState.toLowerCase()}`}
								>
									{connectionState === 'Connected'
										? t('messenger.connected')
										: connectionState === 'Connecting'
											? t('messenger.connecting')
											: t('messenger.disconnected')}
								</span>
							</div>
							<div className="messenger-messages">
								{messagesLoading ? (
									<div className="messenger-messages-loading">
										<Loader2 size={24} className="spin" />
									</div>
								) : (
									<SimpleVirtualList
										className="messenger-messages-virtual"
										items={messages}
										getKey={(m) => m.id}
										renderItem={(m) => {
											const isMe = m.senderId === currentUserId || m.senderId === 'me';
											return (
												<div className={`messenger-message ${isMe ? 'messenger-message--me' : ''}`}>
													{!isMe && (
														<span className="messenger-message-sender">{m.senderName}</span>
													)}
													<span className="messenger-message-content">{m.content}</span>
													<div className="messenger-message-meta">
														<span className="messenger-message-time">
															{formatMessageTime(m.sentAt)}
														</span>
														{isMe && m.readAt && (
															<span className="messenger-message-read">{t('messenger.read')}</span>
														)}
													</div>
												</div>
											);
										}}
										footer={<div ref={messagesEndRef} />}
									/>
								)}
							</div>
							<form className="messenger-input-form" onSubmit={handleSend}>
								<textarea
									ref={inputRef}
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									placeholder={t('messenger.placeholder')}
									rows={1}
									disabled={connectionState !== 'Connected' || sending}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											handleSend(e);
										}
									}}
								/>
								<button
									type="submit"
									disabled={!inputValue.trim() || connectionState !== 'Connected' || sending}
									aria-label={t('messenger.send')}
								>
									{sending ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
								</button>
							</form>
						</>
					) : null}
				</div>

				<div className="messenger-list">
					<div className="messenger-list-header">
						<span>{t('messenger.conversations')}</span>
						{connectionState === 'Connecting' && (
							<Loader2 size={14} className="spin messenger-list-connecting" />
						)}
					</div>
					{loading ? (
						<div className="messenger-list-loading">
							<Loader2 size={24} className="spin" />
							<span>{t('messenger.loading')}</span>
						</div>
					) : (
						<>
							{messageRequests.length > 0 && (
								<div className="messenger-list-section">
									<span className="messenger-list-section-title">
										{t('messenger.messageRequests')}
									</span>
									{messageRequests.map((r) => (
										<button
											key={r.senderId}
											type="button"
											className={`messenger-list-item messenger-list-item--request ${selectedUserId === r.senderId && view === 'request' ? 'messenger-list-item--active' : ''}`}
											onClick={() => openMessageRequest(r)}
										>
											<div className="messenger-list-item-info">
												<span className="messenger-list-item-name">{r.senderName}</span>
												<span className="messenger-list-item-preview">{r.lastMessage}</span>
												<span className="messenger-list-item-time">
													{formatMessageTime(r.lastMessageAt)}
												</span>
											</div>
											{r.count > 1 && <span className="messenger-list-item-badge">{r.count}</span>}
										</button>
									))}
								</div>
							)}
							<div className="messenger-list-section">
								<span className="messenger-list-section-title">{t('messenger.chats')}</span>
								{conversations.length === 0 && messageRequests.length === 0 ? (
									<p className="messenger-list-empty">{t('messenger.noConversations')}</p>
								) : (
									conversations.map((c) => (
										<button
											key={c.otherUserId}
											type="button"
											className={`messenger-list-item ${selectedUserId === c.otherUserId && view === 'chat' ? 'messenger-list-item--active' : ''}`}
											onClick={() => openConversation(c.otherUserId, c.otherUserName)}
										>
											<div className="messenger-list-item-info">
												<span className="messenger-list-item-name">{c.otherUserName}</span>
												<span className="messenger-list-item-preview">
													{c.lastMessageFromMe ? t('messenger.you') + ': ' : ''}
													{c.lastMessage}
												</span>
												<span className="messenger-list-item-time">
													{formatMessageTime(c.lastMessageAt)}
												</span>
											</div>
											{c.unreadCount > 0 && (
												<span className="messenger-list-item-badge">{c.unreadCount}</span>
											)}
										</button>
									))
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
