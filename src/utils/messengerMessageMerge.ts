/** Minimal shape for portal messenger thread rows (REST + optimistic + hub echo). */
export type MessengerUiMessage = {
  id: number;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt: string | null;
};

export function createOptimisticOutgoingMessage(
  content: string,
  optimisticId: number = -Date.now()
): MessengerUiMessage {
  return {
    id: optimisticId,
    senderId: 'me',
    senderName: '',
    content,
    sentAt: new Date().toISOString(),
    readAt: null,
  };
}

/** Merge hub ReceiveChatMessage into open thread state without duplicate ids or optimistic rows. */
export function applyIncomingChatMessage(
  messages: MessengerUiMessage[],
  options: {
    selectedUserId: string | null;
    currentUserId: string;
    senderId: string;
    senderName: string;
    content: string;
    sentAt: string;
    messageId: number;
  }
): MessengerUiMessage[] {
  const { selectedUserId, currentUserId, senderId, senderName, content, sentAt, messageId } =
    options;
  const isInbound = selectedUserId === senderId;
  const isOwnEcho =
    Boolean(selectedUserId) && senderId === currentUserId && senderId !== selectedUserId;
  if (!isInbound && !isOwnEcho) return messages;

  const withoutOptimistic = isOwnEcho
    ? messages.filter((m) => !(m.senderId === 'me' && m.id < 0 && m.content === content))
    : messages;
  if (withoutOptimistic.some((m) => m.id === messageId)) return withoutOptimistic;

  return [
    ...withoutOptimistic,
    {
      id: messageId,
      senderId: isOwnEcho ? 'me' : senderId,
      senderName,
      content,
      sentAt,
      readAt: null,
    },
  ];
}

export function removeOptimisticOutgoingMessages(
  messages: MessengerUiMessage[]
): MessengerUiMessage[] {
  return messages.filter((m) => !(m.senderId === 'me' && m.id < 0));
}
