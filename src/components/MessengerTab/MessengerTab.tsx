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
import './MessengerTab.scss';

type View = 'none' | 'chat' | 'request';

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function MessengerTab({ token }: { token: string }) {
  const { t } = useTranslation('common');
  const {
    connectionState,
    sendMessage,
    acceptMessageRequest,
    rejectMessageRequest,
    onChatMessage,
    onMessageRequest,
    onMessageRequestAccepted,
    onMessageRequestRejected,
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
    void (async () => {
      await Promise.resolve();
      await loadData();
    })();
  }, [loadData]);

  useEffect(() => {
    const unsubChat = onChatMessage((senderId, _senderName, content, sentAt, messageId) => {
      if (selectedUserId === senderId) {
        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            senderId,
            senderName: _senderName,
            content,
            sentAt,
            readAt: null,
          },
        ]);
        markMessagesAsRead(senderId, token).catch(() => {});
      }
      loadData();
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
      loadData();
    });
    const unsubAccept = onMessageRequestAccepted(() => {
      loadData();
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
    return () => {
      unsubChat();
      unsubReq();
      unsubAccept();
      unsubReject();
    };
  }, [
    onChatMessage,
    onMessageRequest,
    onMessageRequestAccepted,
    onMessageRequestRejected,
    selectedUserId,
    token,
    loadData,
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
      if (!selectedUserId || !inputValue.trim() || sending) return;
      try {
        setSending(true);
        await sendMessage(selectedUserId, inputValue.trim());
        setMessages((prev) => [
          ...prev,
          {
            id: -1,
            senderId: 'me',
            senderName: '',
            content: inputValue.trim(),
            sentAt: new Date().toISOString(),
            readAt: null,
          },
        ]);
        setInputValue('');
        loadData();
      } catch {
        toast.error(t('messenger.sendError'));
      } finally {
        setSending(false);
      }
    },
    [selectedUserId, inputValue, sending, sendMessage, loadData, t]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentUserId = (() => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (!stored) return '';
      const u = JSON.parse(stored) as { id?: string };
      return u?.id || '';
    } catch {
      return '';
    }
  })();

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
                  messages.map((m) => {
                    const isMe = m.senderId === currentUserId || m.senderId === 'me';
                    return (
                      <div
                        key={m.id}
                        className={`messenger-message ${isMe ? 'messenger-message--me' : ''}`}
                      >
                        {!isMe && <span className="messenger-message-sender">{m.senderName}</span>}
                        <span className="messenger-message-content">{m.content}</span>
                        <div className="messenger-message-meta">
                          <span className="messenger-message-time">{formatTime(m.sentAt)}</span>
                          {isMe && m.readAt && (
                            <span className="messenger-message-read">{t('messenger.read')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
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
                          {formatTime(r.lastMessageAt)}
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
                          {formatTime(c.lastMessageAt)}
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
