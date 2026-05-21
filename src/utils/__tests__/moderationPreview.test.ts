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

  it('htmlToPlainTextPreview removes script blocks and collapses whitespace', () => {
    expect(htmlToPlainTextPreview('<script>alert(1)</script><p>OK</p>')).toBe('OK');
    expect(htmlToPlainTextPreview('   ')).toBe('');
    expect(htmlToPlainTextPreview(undefined)).toBe('');
  });

  it('shouldUsePlainTextModerationPreview ignores removed/approved for owners', () => {
    expect(shouldUsePlainTextModerationPreview('Removed', true)).toBe(false);
    expect(shouldUsePlainTextModerationPreview('Approved', true)).toBe(false);
  });
});
