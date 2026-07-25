import type { ImgHTMLAttributes, ReactNode } from 'react';

/**
 * `src` is deliberately omitted from the passthrough attributes: the untrusted API value must be
 * supplied as `mediaUrl` so it always goes through the media allow-list instead of reaching the
 * DOM directly. `fallback` is whatever the call site already rendered for a missing image (an
 * icon, a placeholder) and is reused unchanged when the URL is rejected.
 */
export interface MediaImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
	mediaUrl: string | null | undefined;
	fallback?: ReactNode;
}
