import type { FaceConfig, FacesConfigResponse } from '../api/types/facesConfig';

/** Home route for a face, e.g. `/basic/home`. */
export function buildFaceHomePath(face: FaceConfig): string {
	const homePage = face.pages.find((p) => p.pageType.index === 'home');
	if (!homePage) return '/homepage';
	const pagePath = homePage.path.startsWith('/') ? homePage.path.slice(1) : homePage.path;
	return `/${face.index}/${pagePath}`;
}

/** Prefer `basic`, otherwise the first private face in config order. */
export function pickPreferredPrivateFace(faces: FacesConfigResponse): FaceConfig | null {
	const privateFaces = faces.filter((f) => !f.isPublic);
	if (privateFaces.length === 0) return null;
	return privateFaces.find((f) => f.index.toLowerCase() === 'basic') ?? privateFaces[0] ?? null;
}

/** Where to send the user after sign-in when they were on the public tenant. */
export function resolvePostAuthHomePath(faces: FacesConfigResponse): string {
	const preferred = pickPreferredPrivateFace(faces);
	if (preferred) return buildFaceHomePath(preferred);
	const first = faces[0];
	return first ? buildFaceHomePath(first) : '/homepage';
}
