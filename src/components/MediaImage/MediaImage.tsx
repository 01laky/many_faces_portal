import { sanitizeMediaUrl } from '../../utils/safeUrl';
import type { MediaImageProps } from './types';

/**
 * PSH1-D3 / FE-P3 — the single render path for an API-supplied image URL that a call site would
 * otherwise bind straight to `<img src>`.
 *
 * Avatar and cover URLs (`avatarUrl`, `globalAvatarUrl`, `faceAvatarUrl`, `coverUrl`) come from
 * the API, so a hostile or misconfigured response could put an arbitrary URL (`javascript:`,
 * `data:`, an `http://` tracker) into a live `src` attribute on a page that also holds the user's
 * session. Every such surface renders through this component so the value first passes the shared
 * media allow-list (`sanitizeMediaUrl`: HTTPS origins plus backend-signed `/api/uploads/serve`
 * links carrying `sig` + `exp`; localhost only in DEV).
 *
 * Unlike `ReelVideo` — where a rejected URL renders nothing — an image usually already has a
 * "no picture" state at the call site (an initials placeholder or a `UserCircle` / `ImageIcon`
 * glyph). A rejected URL therefore renders exactly that existing `fallback`, so a blocked avatar
 * is indistinguishable from an absent one and no layout hole appears. This mirrors the existing
 * `GridMediaImage` shape, which stays as-is because it also carries locally generated `data:`
 * placeholders that the allow-list must not see.
 */
export function MediaImage({ mediaUrl, fallback = null, ...imgAttributes }: MediaImageProps) {
	const src = sanitizeMediaUrl(mediaUrl);
	if (!src) return <>{fallback}</>;
	return <img {...imgAttributes} src={src} />;
}
