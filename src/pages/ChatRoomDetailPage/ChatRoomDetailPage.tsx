import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { useTranslation } from 'react-i18next';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { resolveHubAccessToken } from '../../utils/authStorage';
import { acquireHubConnection, releaseHubConnection } from '../../api/signalr/hubConnectionManager';
import { shouldConnectChatRoomHub } from '../../api/signalr/hubStartPolicy';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import {
	getChatRoom,
	getChatRoomMessages,
	joinPublicChatRoom,
	requestJoinChatRoom,
	type FaceChatRoomDto,
	type FaceChatRoomMessageDto,
} from '../../api/services/ChatRoomsService';
import { resolveChatRoomMountMessages, resolveChatRoomMountRoom } from './chatRoomMountLogic';
import { SimpleVirtualList } from '../../components/SimpleVirtualList/SimpleVirtualList';
import './ChatRoomDetailPage.scss';

const CHATROOM_HUB_PATH = '/hubs/chatroom';

export function ChatRoomDetailPage({ roomId: roomIdProp }: { roomId: number }) {
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const [room, setRoom] = useState<FaceChatRoomDto | null>(null);
	const [messages, setMessages] = useState<FaceChatRoomMessageDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [msgText, setMsgText] = useState('');
	const [sending, setSending] = useState(false);
	const [joinBusy, setJoinBusy] = useState(false);
	const connRef = useRef<HubConnection | null>(null);

	const loadRoom = useCallback(async () => {
		if (!selectedFace || !token) return null;
		try {
			const r = await getChatRoom(selectedFace.id, roomIdProp, token);
			setRoom(r);
			setLoadError(false);
			return r;
		} catch {
			setLoadError(true);
			setRoom(null);
			return null;
		}
	}, [selectedFace, token, roomIdProp]);

	const loadMessages = useCallback(async () => {
		if (!selectedFace || !token) return;
		try {
			const list = await getChatRoomMessages(selectedFace.id, roomIdProp, token, { pageSize: 80 });
			setMessages(list);
		} catch {
			setMessages([]);
		}
	}, [selectedFace, token, roomIdProp]);

	useEffect(() => {
		if (!selectedFace || !token) return;
		let cancelled = false;
		queueMicrotask(() => {
			if (!cancelled) setLoading(true);
		});
		void (async () => {
			try {
				const [roomResult, messagesResult] = await Promise.allSettled([
					getChatRoom(selectedFace.id, roomIdProp, token),
					getChatRoomMessages(selectedFace.id, roomIdProp, token, { pageSize: 80 }),
				]);
				if (cancelled) return;
				const { room: r, loadError: roomError } = resolveChatRoomMountRoom(roomResult);
				setRoom(r);
				setLoadError(roomError);
				setMessages(resolveChatRoomMountMessages(r, messagesResult));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [selectedFace, token, roomIdProp]);

	useEffect(() => {
		if (
			!token ||
			!room ||
			!shouldConnectChatRoomHub({
				token,
				isMember: room.isMember,
				isHostViewer: room.isHostViewer,
			})
		) {
			connRef.current = null;
			return;
		}

		const activeRoom = room;
		const scopeKey = token;
		const tokenRef = { current: token };
		let cancelled = false;

		const onReceiveRoomMessage = (
			faceChatRoomId: number,
			senderUserId: string,
			_senderName: string,
			content: string,
			sentAt: string,
			messageId: number
		) => {
			if (faceChatRoomId !== activeRoom.id) return;
			setMessages((prev) => {
				if (prev.some((m) => m.id === messageId)) return prev;
				return [
					...prev,
					{
						id: messageId,
						senderUserId,
						content,
						sentAt,
					},
				];
			});
		};

		const onChatRoomClosed = (closedId: number) => {
			if (closedId !== activeRoom.id) return;
			toast.info(t('chatRoom.closed', 'This chat room was closed.'));
			navigate(-1);
		};

		void (async () => {
			try {
				const conn = await acquireHubConnection(CHATROOM_HUB_PATH, scopeKey, () =>
					resolveHubAccessToken(tokenRef.current)
				);
				if (cancelled) {
					await releaseHubConnection(CHATROOM_HUB_PATH, scopeKey);
					return;
				}
				connRef.current = conn;
				conn.on('ReceiveRoomMessage', onReceiveRoomMessage);
				conn.on('ChatRoomClosed', onChatRoomClosed);
				await conn.invoke('JoinRoom', activeRoom.id);
			} catch {
				toast.error(t('chatRoom.hubError', 'Could not connect to live chat.'));
			}
		})();

		return () => {
			cancelled = true;
			const conn = connRef.current;
			if (conn) {
				void conn.invoke('LeaveRoom', activeRoom.id).catch(() => {});
				conn.off('ReceiveRoomMessage', onReceiveRoomMessage);
				conn.off('ChatRoomClosed', onChatRoomClosed);
			}
			connRef.current = null;
			void releaseHubConnection(CHATROOM_HUB_PATH, scopeKey);
		};
	}, [token, room, navigate, t]);

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		const text = msgText.trim();
		const c = connRef.current;
		if (!text || !c || c.state !== 'Connected') return;
		setSending(true);
		try {
			await c.invoke('SendRoomMessage', roomIdProp, text);
			setMsgText('');
		} catch {
			toast.error(t('chatRoom.sendFailed', 'Failed to send message'));
		} finally {
			setSending(false);
		}
	};

	const handleJoinPublic = async () => {
		if (!selectedFace || !token) return;
		setJoinBusy(true);
		try {
			await joinPublicChatRoom(selectedFace.id, roomIdProp, token);
			await loadRoom();
			await loadMessages();
			toast.success(t('chatRoom.joined', 'You joined the room.'));
		} catch {
			toast.error(t('chatRoom.joinFailed', 'Could not join'));
		} finally {
			setJoinBusy(false);
		}
	};

	const handleRequestJoin = async () => {
		if (!selectedFace || !token) return;
		setJoinBusy(true);
		try {
			await requestJoinChatRoom(selectedFace.id, roomIdProp, token);
			await loadRoom();
			toast.success(t('chatRoom.requestSent', 'Join request sent.'));
		} catch {
			toast.error(t('chatRoom.requestFailed', 'Could not send request'));
		} finally {
			setJoinBusy(false);
		}
	};

	if (!selectedFace) {
		return (
			<div className="chatroom-detail chatroom-detail--centered">
				<p>{t('chatRoom.noFace', 'Select a face first.')}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="chatroom-detail chatroom-detail--centered">
				<Loader2 className="chatroom-detail-spinner" size={32} />
			</div>
		);
	}

	if (loadError || !room) {
		return (
			<div className="chatroom-detail chatroom-detail--centered">
				<p>{t('chatRoom.notFound', 'Room not found.')}</p>
			</div>
		);
	}

	const canReadMessages = room.isHostViewer || room.isMember;
	const canType = room.isMember && room.canParticipate && !room.isHostViewer;

	return (
		<div className="chatroom-detail">
			{room.description ? <p className="chatroom-detail-desc">{room.description}</p> : null}
			<p className="chatroom-detail-meta">
				{room.memberCount} {t('chatRoom.members', 'members')}
				{room.isSystemManaged ? ` · ${t('chatRoom.system', 'System')}` : ''}
				{room.isHostViewer ? ` · ${t('chatRoom.hostView', 'Host view — read only')}` : ''}
			</p>

			{!canReadMessages && room.canParticipate && (
				<div className="chatroom-detail-actions">
					{room.isPublic ? (
						<button
							type="button"
							className="chatroom-detail-primary"
							disabled={joinBusy}
							onClick={handleJoinPublic}
						>
							{joinBusy ? '…' : t('chatRoom.join', 'Join room')}
						</button>
					) : (
						<button
							type="button"
							className="chatroom-detail-primary"
							disabled={joinBusy || room.hasPendingRequest}
							onClick={handleRequestJoin}
						>
							{room.hasPendingRequest
								? t('chatRoom.pending', 'Request pending')
								: t('chatRoom.requestJoin', 'Request to join')}
						</button>
					)}
				</div>
			)}

			{canReadMessages && (
				<SimpleVirtualList
					className="chatroom-detail-messages"
					items={messages}
					getKey={(m) => m.id}
					renderItem={(m) => (
						<li className="chatroom-detail-msg">
							<span className="chatroom-detail-msg-sender">{m.senderUserId.slice(0, 8)}…</span>
							<span className="chatroom-detail-msg-body">{m.content}</span>
							<time className="chatroom-detail-msg-time" dateTime={m.sentAt}>
								{new Date(m.sentAt).toLocaleTimeString(undefined, {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</time>
						</li>
					)}
				/>
			)}

			{canType && (
				<form className="chatroom-detail-compose" onSubmit={handleSend}>
					<input
						className="chatroom-detail-input"
						value={msgText}
						onChange={(e) => setMsgText(e.target.value)}
						placeholder={t('chatRoom.placeholder', 'Message…')}
						maxLength={8000}
						disabled={sending}
					/>
					<button
						type="submit"
						className="chatroom-detail-send"
						disabled={sending || !msgText.trim()}
					>
						<Send size={18} />
					</button>
				</form>
			)}
		</div>
	);
}
