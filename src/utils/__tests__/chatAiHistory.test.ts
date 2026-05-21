import { describe, expect, it } from 'vitest';
import { buildChatAiHistory, MAX_CHAT_AI_HISTORY_PAIRS } from '../chatAiHistory';

describe('buildChatAiHistory', () => {
  it('returns empty history for empty transcript', () => {
    expect(buildChatAiHistory([])).toEqual([]);
  });

  it('pairs consecutive user→ai messages', () => {
    expect(
      buildChatAiHistory([
        { role: 'user', content: 'Hi' },
        { role: 'ai', content: 'Hello' },
        { role: 'user', content: 'Bye' },
        { role: 'ai', content: 'Goodbye' },
      ])
    ).toEqual([
      { userMessage: 'Hi', aiResponse: 'Hello' },
      { userMessage: 'Bye', aiResponse: 'Goodbye' },
    ]);
  });

  it('skips incomplete tail when last message has no ai reply', () => {
    expect(
      buildChatAiHistory([
        { role: 'user', content: 'One' },
        { role: 'ai', content: 'Two' },
        { role: 'user', content: 'Three' },
      ])
    ).toEqual([{ userMessage: 'One', aiResponse: 'Two' }]);
  });

  it('skips non-alternating roles (double user)', () => {
    expect(
      buildChatAiHistory([
        { role: 'user', content: 'A' },
        { role: 'user', content: 'B' },
        { role: 'ai', content: 'C' },
      ])
    ).toEqual([]);
  });

  it(`keeps only the latest ${MAX_CHAT_AI_HISTORY_PAIRS} pairs`, () => {
    const messages = Array.from({ length: MAX_CHAT_AI_HISTORY_PAIRS + 2 }, (_, i) => [
      { role: 'user' as const, content: `u${i}` },
      { role: 'ai' as const, content: `a${i}` },
    ]).flat();
    const history = buildChatAiHistory(messages);
    expect(history).toHaveLength(MAX_CHAT_AI_HISTORY_PAIRS);
    expect(history[0].userMessage).toBe('u2');
    expect(history.at(-1)?.userMessage).toBe(`u${MAX_CHAT_AI_HISTORY_PAIRS + 1}`);
  });

  it('respects custom maxPairs cap', () => {
    const messages = [
      { role: 'user' as const, content: '1' },
      { role: 'ai' as const, content: '1a' },
      { role: 'user' as const, content: '2' },
      { role: 'ai' as const, content: '2a' },
    ];
    expect(buildChatAiHistory(messages, 1)).toEqual([{ userMessage: '2', aiResponse: '2a' }]);
  });
});
