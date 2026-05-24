import { describe, expect, it } from 'vitest';
import { redactLogProperties, redactSensitiveLogText } from '../logRedaction';

describe('logRedaction (PSH1-H1)', () => {
  it('redacts access_token query params in strings', () => {
    expect(redactSensitiveLogText('hub?access_token=secret123&x=1')).toContain('[REDACTED]');
    expect(redactSensitiveLogText('hub?access_token=secret123&x=1')).not.toContain('secret123');
  });

  it('redacts sensitive property keys', () => {
    const out = redactLogProperties({ refreshToken: 'abc', userId: '1' });
    expect(out?.refreshToken).toBe('[REDACTED]');
    expect(out?.userId).toBe('1');
  });
});
