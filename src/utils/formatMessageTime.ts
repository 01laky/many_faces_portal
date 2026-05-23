export type FormatMessageTimeOptions = {
  now?: Date;
  locale?: string;
};

/**
 * Messenger-friendly timestamp: time-only for today, short date+time otherwise.
 * Pass `now` in tests for stable boundaries.
 */
export function formatMessageTime(
  iso: string | null | undefined,
  options: FormatMessageTimeOptions = {}
): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = options.now ?? new Date();
    const locale = options.locale;
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
