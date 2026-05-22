import { useEffect, useState, useRef, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { absoluteScopedUrl } from '../../api/faceApiRouting';
import { Button } from '../../components/radix/Button';
import { buildChatAiHistory, type ChatAiMessage } from '../../utils/chatAiHistory';
import './ChatPage.scss';

type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected' | 'Reconnecting';

type AiEnabledResponse = { enabled: boolean };

export function ChatPage() {
  const { t } = useTranslation('common');
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatAiMessage[]>([]);
  const [input, setInput] = useState('');
  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');
  const [isSending, setIsSending] = useState(false);
  const [aiGloballyEnabled, setAiGloballyEnabled] = useState(true);
  const connectionRef = useRef<HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(absoluteScopedUrl('/api/ai/enabled'));
        if (!res.ok) return;
        const body = (await res.json()) as AiEnabledResponse;
        if (!cancelled) setAiGloballyEnabled(body.enabled !== false);
      } catch {
        /* keep default enabled — hub still returns a friendly message when off */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build and start SignalR connection when token is available
  useEffect(() => {
    if (!token) return;

    const hubUrl = absoluteScopedUrl('/hubs/chat');
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.on('ReceiveAiMessage', (userMessage: string, aiResponse: string) => {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'ai', content: aiResponse },
      ]);
      setIsSending(false);
    });

    connection.onreconnecting(() => setConnectionState('Reconnecting'));
    connection.onreconnected(() => setConnectionState('Connected'));
    connection.onclose(() => setConnectionState('Disconnected'));

    queueMicrotask(() => setConnectionState('Connecting'));
    connection
      .start()
      .then(() => setConnectionState('Connected'))
      .catch(() => setConnectionState('Disconnected'));

    return () => {
      connection.stop().catch(() => {});
      connectionRef.current = null;
      setConnectionState('Disconnected');
    };
  }, [token]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending || connectionState !== 'Connected' || !aiGloballyEnabled) return;

    const conn = connectionRef.current;
    if (!conn) return;

    setInput('');
    setIsSending(true);
    const history = buildChatAiHistory(messages);
    try {
      await conn.invoke('SendToAi', text, history);
    } catch {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const inputDisabled = connectionState !== 'Connected' || isSending || !aiGloballyEnabled;

  const statusLabel =
    connectionState === 'Connecting'
      ? t('pages.chat.connecting')
      : connectionState === 'Connected'
        ? t('pages.chat.connected')
        : connectionState === 'Reconnecting'
          ? t('pages.chat.connecting')
          : t('pages.chat.disconnected');

  return (
    <div className="chat-page">
      <div className="chat-page__status-bar">
        <span
          className={`chat-page__status chat-page__status--${connectionState.toLowerCase()}`}
          title={connectionState}
        >
          {statusLabel}
        </span>
      </div>

      {!aiGloballyEnabled && (
        <p className="chat-page__ai-disabled" role="status">
          {t('pages.chat.aiDisabled')}
        </p>
      )}

      <div className="chat-page__messages">
        {messages.length === 0 && connectionState === 'Connected' && aiGloballyEnabled && (
          <p className="chat-page__empty">{t('pages.chat.placeholder')}</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-page__message chat-page__message--${msg.role}`}>
            <span className="chat-page__message-label">
              {msg.role === 'user' ? t('pages.chat.you') : t('pages.chat.ai')}
            </span>
            <div className="chat-page__message-content">{msg.content}</div>
          </div>
        ))}
        {isSending && (
          <div className="chat-page__message chat-page__message--ai">
            <span className="chat-page__message-label">{t('pages.chat.ai')}</span>
            <div className="chat-page__message-content chat-page__typing">…</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-page__input-row">
        <input
          type="text"
          className="chat-page__input"
          placeholder={aiGloballyEnabled ? t('pages.chat.placeholder') : t('pages.chat.aiDisabled')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={inputDisabled}
          aria-disabled={inputDisabled}
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || inputDisabled}
          className="chat-page__send"
        >
          {t('pages.chat.send')}
        </Button>
      </div>
    </div>
  );
}
