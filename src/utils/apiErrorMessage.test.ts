import { describe, expect, it } from 'vitest';
import { parseApiErrorBody, getApiErrorMessage } from './apiErrorMessage';

describe('parseApiErrorBody', () => {
  it('uses { error } string', () => {
    expect(parseApiErrorBody('{"error":"Nope"}', 'fb')).toBe('Nope');
  });

  it('prefers ProblemDetails detail over title', () => {
    const j = JSON.stringify({ title: 'Bad', detail: 'Use this' });
    expect(parseApiErrorBody(j, 'fb')).toBe('Use this');
  });

  it('uses title when detail missing', () => {
    expect(parseApiErrorBody('{"title":"Only title"}', 'fb')).toBe('Only title');
  });

  it('flattens Identity-style errors object', () => {
    const j = JSON.stringify({ errors: { Email: ['a', 'b'] } });
    expect(parseApiErrorBody(j, 'fb')).toBe('a b');
  });

  it('returns trimmed plain text under 280 chars when not JSON', () => {
    expect(parseApiErrorBody('  plain  ', 'fb')).toBe('plain');
  });

  it('uses fallback for huge non-JSON body', () => {
    const long = 'x'.repeat(300);
    expect(parseApiErrorBody(long, 'fb')).toBe('fb');
  });

  it('uses fallback for empty string', () => {
    expect(parseApiErrorBody('   ', 'fb')).toBe('fb');
  });
});

describe('getApiErrorMessage', () => {
  it('reads Response text and parses JSON', async () => {
    const res = new Response(JSON.stringify({ error: 'from server' }), { status: 400 });
    await expect(getApiErrorMessage(res, 'fb')).resolves.toBe('from server');
  });
});
