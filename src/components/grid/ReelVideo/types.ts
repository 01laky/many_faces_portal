import type { VideoHTMLAttributes } from 'react';

/**
 * `src` is deliberately omitted from the passthrough attributes: the untrusted API value must be
 * supplied as `videoUrl` so it always goes through the media allow-list instead of reaching the
 * DOM directly.
 */
export interface ReelVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
	videoUrl: string | null | undefined;
}
