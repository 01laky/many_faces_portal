import { describe, expect, it } from 'vitest';
import { htmlToPlainTextPreview } from '../moderationPreview';

describe('moderationPreview (PSH1-T-D05)', () => {
  it('script tag stripped from plain text preview', () => {
    const text = htmlToPlainTextPreview('<p>Hi</p><script>alert(1)</script>');
    expect(text).not.toContain('alert');
    expect(text).toContain('Hi');
  });
});
