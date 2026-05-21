/** One user prompt and the matching AI reply sent as conversation context to the hub. */
export interface ChatAiHistoryEntry {
  userMessage: string;
  aiResponse: string;
}

export type ChatAiMessageRole = 'user' | 'ai';

export interface ChatAiMessage {
  role: ChatAiMessageRole;
  content: string;
}

/** Max user/AI pairs included in `SendToAi` history (matches `ChatPage` hub contract). */
export const MAX_CHAT_AI_HISTORY_PAIRS = 5;

/**
 * Builds ordered user→AI pairs from the in-memory transcript.
 * Skips incomplete tails (odd length or non-alternating roles) and keeps only the latest N pairs.
 */
export function buildChatAiHistory(
  messages: ChatAiMessage[],
  maxPairs: number = MAX_CHAT_AI_HISTORY_PAIRS
): ChatAiHistoryEntry[] {
  const pairs: ChatAiHistoryEntry[] = [];
  for (let i = 0; i + 1 < messages.length; i += 2) {
    if (messages[i].role === 'user' && messages[i + 1].role === 'ai') {
      pairs.push({
        userMessage: messages[i].content,
        aiResponse: messages[i + 1].content,
      });
    }
  }
  return pairs.length <= maxPairs ? pairs : pairs.slice(-maxPairs);
}
