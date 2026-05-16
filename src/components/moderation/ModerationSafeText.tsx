/**
 * SHV2 PI-8: displays untrusted creator content as plain text (React text node), never as HTML.
 */
interface ModerationSafeTextProps {
  text: string;
  className?: string;
}

export function ModerationSafeText({
  text,
  className = 'moderation-safe-text',
}: ModerationSafeTextProps) {
  return <div className={className}>{text}</div>;
}
