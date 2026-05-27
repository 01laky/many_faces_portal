import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { resolveHubAccessToken } from '../utils/authStorage';
import { acquireHubConnection, releaseHubConnection } from '../api/signalr/hubConnectionManager';
import type {
	MessengerConnectionState,
	MessengerContextValue,
	MessengerProviderProps,
} from './types';

const MESSENGER_HUB_PATH = '/hubs/messenger';

const MessengerContext = createContext<MessengerContextValue | null>(null);

export function useMessenger() {
	const ctx = useContext(MessengerContext);
	if (!ctx) throw new Error('useMessenger must be used within MessengerProvider');
	return ctx;
}

export function MessengerProvider({
	token,
	children,
	messengerEnabled = true,
}: MessengerProviderProps) {
	const [connectionState, setConnectionState] = useState<MessengerConnectionState>('Disconnected');
	const connectionRef = useRef<HubConnection | null>(null);
	const tokenRef = useRef(token);

	useEffect(() => {
		tokenRef.current = token;
	}, [token]);

	const callbacksRef = useRef({
		chatMessage: new Set<(a: string, b: string, c: string, d: string, e: number) => void>(),
		messageRequest: new Set<(a: string, b: string, c: string, d: string) => void>(),
		friendRequest: new Set<(a: string, b: string) => void>(),
		messageRequestAccepted: new Set<(a: string, b: string) => void>(),
		messageRequestRejected: new Set<(a: string) => void>(),
		notification: new Set<(a: number, b: string, c: string, d: string, e: string) => void>(),
		platformChatError: new Set<(code: string) => void>(),
	});

	const onChatMessage = useCallback(
		(
			cb: (
				senderId: string,
				senderName: string,
				content: string,
				sentAt: string,
				messageId: number
			) => void
		) => {
			callbacksRef.current.chatMessage.add(cb);
			return () => callbacksRef.current.chatMessage.delete(cb);
		},
		[]
	);
	const onMessageRequest = useCallback(
		(cb: (senderId: string, senderName: string, content: string, sentAt: string) => void) => {
			callbacksRef.current.messageRequest.add(cb);
			return () => callbacksRef.current.messageRequest.delete(cb);
		},
		[]
	);
	const onFriendRequest = useCallback((cb: (senderId: string, senderName: string) => void) => {
		callbacksRef.current.friendRequest.add(cb);
		return () => callbacksRef.current.friendRequest.delete(cb);
	}, []);
	const onMessageRequestAccepted = useCallback(
		(cb: (accepterId: string, accepterName: string) => void) => {
			callbacksRef.current.messageRequestAccepted.add(cb);
			return () => callbacksRef.current.messageRequestAccepted.delete(cb);
		},
		[]
	);
	const onMessageRequestRejected = useCallback((cb: (rejecterId: string) => void) => {
		callbacksRef.current.messageRequestRejected.add(cb);
		return () => callbacksRef.current.messageRequestRejected.delete(cb);
	}, []);
	const onNotification = useCallback(
		(cb: (id: number, title: string, message: string, type: string, createdAt: string) => void) => {
			callbacksRef.current.notification.add(cb);
			return () => callbacksRef.current.notification.delete(cb);
		},
		[]
	);

	const onPlatformChatError = useCallback((cb: (code: string) => void) => {
		callbacksRef.current.platformChatError.add(cb);
		return () => callbacksRef.current.platformChatError.delete(cb);
	}, []);

	const sendMessage = useCallback(
		async (receiverId: string, content: string) => {
			const conn = connectionRef.current;
			if (!conn || connectionState !== 'Connected') throw new Error('Not connected');
			await conn.invoke('SendChatMessage', receiverId, content.trim());
		},
		[connectionState]
	);

	const acceptMessageRequest = useCallback(
		async (senderId: string) => {
			const conn = connectionRef.current;
			if (!conn || connectionState !== 'Connected') throw new Error('Not connected');
			await conn.invoke('AcceptMessageRequest', senderId);
		},
		[connectionState]
	);

	const rejectMessageRequest = useCallback(
		async (senderId: string) => {
			const conn = connectionRef.current;
			if (!conn || connectionState !== 'Connected') throw new Error('Not connected');
			await conn.invoke('RejectMessageRequest', senderId);
		},
		[connectionState]
	);

	useEffect(() => {
		if (!token || !messengerEnabled) {
			connectionRef.current = null;
			queueMicrotask(() => setConnectionState('Disconnected'));
			return;
		}

		let cancelled = false;
		const scopeKey = token;

		const onReceiveChatMessage = (
			senderId: string,
			senderName: string,
			content: string,
			sentAt: string,
			messageId: number
		) => {
			callbacksRef.current.chatMessage.forEach((cb) =>
				cb(senderId, senderName, content, sentAt, messageId)
			);
		};
		const onReceiveMessageRequest = (
			senderId: string,
			senderName: string,
			content: string,
			sentAt: string
		) => {
			callbacksRef.current.messageRequest.forEach((cb) =>
				cb(senderId, senderName, content, sentAt)
			);
		};
		const onReceiveFriendRequest = (senderId: string, senderName: string) => {
			callbacksRef.current.friendRequest.forEach((cb) => cb(senderId, senderName));
		};
		const onMessageRequestAcceptedEvent = (accepterId: string, accepterName: string) => {
			callbacksRef.current.messageRequestAccepted.forEach((cb) => cb(accepterId, accepterName));
		};
		const onMessageRequestRejectedEvent = (rejecterId: string) => {
			callbacksRef.current.messageRequestRejected.forEach((cb) => cb(rejecterId));
		};
		const onReceiveNotification = (
			id: number,
			title: string,
			message: string,
			type: string,
			createdAt: string
		) => {
			callbacksRef.current.notification.forEach((cb) => cb(id, title, message, type, createdAt));
		};
		const onReceivePlatformChatError = (code: string) => {
			callbacksRef.current.platformChatError.forEach((cb) => cb(code));
		};

		queueMicrotask(() => setConnectionState('Connecting'));

		void (async () => {
			try {
				const connection = await acquireHubConnection(MESSENGER_HUB_PATH, scopeKey, () =>
					resolveHubAccessToken(tokenRef.current)
				);
				if (cancelled) {
					await releaseHubConnection(MESSENGER_HUB_PATH, scopeKey);
					return;
				}

				connectionRef.current = connection;

				connection.on('ReceiveChatMessage', onReceiveChatMessage);
				connection.on('ReceiveMessageRequest', onReceiveMessageRequest);
				connection.on('ReceiveFriendRequest', onReceiveFriendRequest);
				connection.on('MessageRequestAccepted', onMessageRequestAcceptedEvent);
				connection.on('MessageRequestRejected', onMessageRequestRejectedEvent);
				connection.on('ReceiveNotification', onReceiveNotification);
				connection.on('ReceivePlatformChatError', onReceivePlatformChatError);

				connection.onreconnecting(() => {
					if (!cancelled) setConnectionState('Connecting');
				});
				connection.onreconnected(() => {
					if (!cancelled) setConnectionState('Connected');
				});
				connection.onclose(() => {
					if (!cancelled) setConnectionState('Disconnected');
				});

				setConnectionState(connection.state === 'Connected' ? 'Connected' : 'Connecting');
			} catch {
				if (!cancelled) setConnectionState('Disconnected');
			}
		})();

		return () => {
			cancelled = true;
			const conn = connectionRef.current;
			if (conn) {
				conn.off('ReceiveChatMessage', onReceiveChatMessage);
				conn.off('ReceiveMessageRequest', onReceiveMessageRequest);
				conn.off('ReceiveFriendRequest', onReceiveFriendRequest);
				conn.off('MessageRequestAccepted', onMessageRequestAcceptedEvent);
				conn.off('MessageRequestRejected', onMessageRequestRejectedEvent);
				conn.off('ReceiveNotification', onReceiveNotification);
				conn.off('ReceivePlatformChatError', onReceivePlatformChatError);
			}
			connectionRef.current = null;
			void releaseHubConnection(MESSENGER_HUB_PATH, scopeKey);
			queueMicrotask(() => setConnectionState('Disconnected'));
		};
	}, [token, messengerEnabled]);

	const value = useMemo(
		(): MessengerContextValue => ({
			connectionState,
			sendMessage,
			acceptMessageRequest,
			rejectMessageRequest,
			onChatMessage,
			onMessageRequest,
			onFriendRequest,
			onMessageRequestAccepted,
			onMessageRequestRejected,
			onNotification,
			onPlatformChatError,
		}),
		[
			connectionState,
			sendMessage,
			acceptMessageRequest,
			rejectMessageRequest,
			onChatMessage,
			onMessageRequest,
			onFriendRequest,
			onMessageRequestAccepted,
			onMessageRequestRejected,
			onNotification,
			onPlatformChatError,
		]
	);

	return <MessengerContext.Provider value={value}>{children}</MessengerContext.Provider>;
}
