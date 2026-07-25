import { sanitizeMediaUrl } from '../../../utils/safeUrl';
import type { ReelVideoProps } from './types';

/**
 * PSH1-D3 / FE-P3 — the single render path for API-supplied reel media.
 *
 * `ReelItem.videoUrl` comes straight from `GET /{face}/api/Reels`, so a hostile or misconfigured
 * API response could otherwise put an arbitrary URL (`javascript:`, `data:`, an `http://` tracker)
 * into a live `<video src>` attribute. Every reel surface renders through this component so the
 * value is passed through the shared media allow-list (`sanitizeMediaUrl`: HTTPS origins plus
 * backend-signed `uploads/serve` links) first.
 *
 * On a rejected or empty URL nothing is rendered at all, mirroring the blog image list in
 * `BlogDetailPage` — the surrounding card, overlay and page chrome stay intact.
 */
export function ReelVideo({ videoUrl, ...videoAttributes }: ReelVideoProps) {
	const src = sanitizeMediaUrl(videoUrl);
	if (!src) return null;
	return <video {...videoAttributes} src={src} />;
}
