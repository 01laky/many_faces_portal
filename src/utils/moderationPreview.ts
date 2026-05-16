/**
 * SHV2 PI-8: creator-facing moderation preview — plain text only while content is not public.
 */

/** True when blog HTML must not be rendered via dangerouslySetInnerHTML (pending/rejected owner view). */
export function shouldUsePlainTextModerationPreview(
  approvalStatus: string | undefined,
  isOwner: boolean
): boolean {
  if (!isOwner) return false;
  return approvalStatus === 'PendingApproval' || approvalStatus === 'Rejected';
}

/** Strips HTML tags for a safe text-only preview (defense in depth if API still returns HTML). */
export function htmlToPlainTextPreview(html: string | undefined | null): string {
  if (!html?.trim()) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
