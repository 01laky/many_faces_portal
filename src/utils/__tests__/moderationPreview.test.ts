import { describe, expect, it } from 'vitest';
import { htmlToPlainTextPreview, shouldUsePlainTextModerationPreview } from '../moderationPreview';

describe('moderationPreview (PI-8)', () => {
  it('shouldUsePlainTextModerationPreview for owner pending/rejected only', () => {
    expect(shouldUsePlainTextModerationPreview('PendingApproval', true)).toBe(true);
    expect(shouldUsePlainTextModerationPreview('Rejected', true)).toBe(true);
    expect(shouldUsePlainTextModerationPreview('Approved', true)).toBe(false);
    expect(shouldUsePlainTextModerationPreview('PendingApproval', false)).toBe(false);
  });

  it('htmlToPlainTextPreview strips tags', () => {
    expect(htmlToPlainTextPreview('<p>Hi <b>there</b></p>')).toBe('Hi there');
  });
});
