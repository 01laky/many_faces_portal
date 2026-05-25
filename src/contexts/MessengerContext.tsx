import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { resolveHubAccessToken } from '../utils/authStorage';
import { buildAuthenticatedHubConnection } from '../api/signalr/buildAuthenticatedHubConnection';

type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected';

interface MessengerContextValue {
	connectionState: ConnectionState;
	sendMessage: (receiverId: string, content: string) => Promise<void>;
	acceptMessageRequest: (senderId: string) => Promise<void>;
	rejectMessageRequest: (senderId: string) => Promise<void>;
	onChatMessage: (
		cb: (
			senderId: string,
			senderName: string,
			content: string,
			sentAt: string,
			messageId: number
		) => void
	) => () => void;
	onMessageRequest: (
		cb: (senderId: string, senderName: string, content: string, sentAt: string) => void
	) => () => void;
	onFriendRequest: (cb: (senderId: string, senderName: string) => void) => () => void;
	onMessageRequestAccepted: (cb: (accepterId: string, accepterName: string) => void) => () => void;
	onMessageRequestRejected: (cb: (rejecterId: string) => void) => () => void;
	onNotification: (
		cb: (id: number, title: string, message: string, type: string, createdAt: string) => void
	) => () => void;
	onPlatformChatError: (cb: (code: string) => void) => () => void;
}

const MessengerContext = createContext<MessengerContextValue | null>(null);

export function useMessenger() {
	const ctx = useContext(MessengerContext);
	if (!ctx) throw new Error('useMessenger must be used within MessengerProvider');
	return ctx;
}

export function MessengerProvider({
	token,
	children,
}: {
	token: string | null;
	children: ReactNode;
}) {
	const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');
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
		if (!token) {
			connectionRef.current?.stop();
			connectionRef.current = null;
			queueMicrotask(() => setConnectionState('Disconnected'));
			return;
		}

		const connection = buildAuthenticatedHubConnection('/hubs/messenger', () =>
			resolveHubAccessToken(tokenRef.current)
		);

		connectionRef.current = connection;

		connection.on(
			'ReceiveChatMessage',
			(
				senderId: string,
				senderName: string,
				content: string,
				sentAt: string,
				messageId: number
			) => {
				callbacksRef.current.chatMessage.forEach((cb) =>
					cb(senderId, senderName, content, sentAt, messageId)
				);
			}
		);
		connection.on(
			'ReceiveMessageRequest',
			(senderId: string, senderName: string, content: string, sentAt: string) => {
				callbacksRef.current.messageRequest.forEach((cb) =>
					cb(senderId, senderName, content, sentAt)
				);
			}
		);
		connection.on('ReceiveFriendRequest', (senderId: string, senderName: string) => {
			callbacksRef.current.friendRequest.forEach((cb) => cb(senderId, senderName));
		});
		connection.on('MessageRequestAccepted', (accepterId: string, accepterName: string) => {
			callbacksRef.current.messageRequestAccepted.forEach((cb) => cb(accepterId, accepterName));
		});
		connection.on('MessageRequestRejected', (rejecterId: string) => {
			callbacksRef.current.messageRequestRejected.forEach((cb) => cb(rejecterId));
		});
		connection.on(
			'ReceiveNotification',
			(id: number, title: string, message: string, type: string, createdAt: string) => {
				callbacksRef.current.notification.forEach((cb) => cb(id, title, message, type, createdAt));
			}
		);

		connection.on('ReceivePlatformChatError', (code: string) => {
			callbacksRef.current.platformChatError.forEach((cb) => cb(code));
		});

		queueMicrotask(() => setConnectionState('Connecting'));
		connection
			.start()
			.then(() => setConnectionState('Connected'))
			.catch(() => setConnectionState('Disconnected'));

		return () => {
			connection.stop();
			connectionRef.current = null;
			queueMicrotask(() => setConnectionState('Disconnected'));
		};
	}, [token]);

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
