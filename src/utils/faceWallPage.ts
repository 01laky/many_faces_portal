import type { FaceConfig } from '../api/types/facesConfig';

/** True when the URL path is a wall-type page for the selected face (any language route variant). */
export function pathnameMatchesWallPage(
	pathname: string,
	selectedFace: FaceConfig | null
): boolean {
	if (!selectedFace) return false;
	const segments = pathname.split('/').filter(Boolean);
	if (segments.length < 3) return false;
	const faceSeg = segments[1];
	if (faceSeg.toLowerCase() !== selectedFace.index.toLowerCase()) return false;
	const rest = segments.slice(2);
	const pathSuffix = '/' + rest.join('/');

	return selectedFace.pages.some((p) => {
		if (p.pageType?.index !== 'wall') return false;
		const basePath = p.path.startsWith('/') ? p.path.slice(1) : p.path;
		const candidates = new Set<string>([`/${basePath}`]);
		for (const rt of p.routeTranslations) {
			const tr = rt.translatedRoute.startsWith('/')
				? rt.translatedRoute.slice(1)
				: rt.translatedRoute;
			if (tr) candidates.add(`/${tr}`);
		}
		for (const c of candidates) {
			if (pathSuffix === c || pathSuffix.startsWith(c + '/')) return true;
		}
		return false;
	});
}
