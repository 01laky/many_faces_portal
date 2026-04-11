import type { FaceConfig, PageConfig } from '../api/types/facesConfig';

/**
 * Build all route paths for a page within a face.
 * Paths look like: ["public/home", "public/domov"] using `page.routeTranslations`.
 */
export function buildFacePagePaths(face: FaceConfig, page: PageConfig): string[] {
  const basePath = page.path.startsWith('/') ? page.path.slice(1) : page.path;
  const paths: string[] = [`${face.index}/${basePath}`];

  for (const rt of page.routeTranslations) {
    const translatedPath = rt.translatedRoute.startsWith('/')
      ? rt.translatedRoute.slice(1)
      : rt.translatedRoute;
    if (translatedPath && translatedPath !== basePath) {
      paths.push(`${face.index}/${translatedPath}`);
    }
  }

  return paths;
}
