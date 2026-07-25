// @vitest-environment happy-dom
/**
 * GPL-22 (global app preloader, portal): the lazy-route `Suspense` fallback must render the
 * small inline preloader, never the bootstrap shell. A code-split chunk load happens long
 * after `AppBootstrapGate` opened, so repainting the fixed full-viewport brand animation
 * would make an ordinary navigation look like a cold start.
 *
 * Pipeline position: `AppRoutes` (and `PageGridLayout` / `ComponentBlock` / settings panels)
 * wrap their `React.lazy` pages in `<Suspense fallback={<RouteLoadingFallback />}>`.
 *
 * Sizing/position live in `globalAppPreloader.scss`, which Vitest does not evaluate, so the
 * variant is asserted twice: on the rendered class contract, and on the stylesheet source
 * that gives `--bootstrap` its `position: fixed` viewport cover.
 */
import { describe, it, expect, vi } from 'vitest';
import { Suspense, lazy } from 'react';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { RouteLoadingFallback } from '../routeLoadingFallback';

vi.mock('react-loading-indicators', () => ({
	ThreeDot: () => <div data-testid="three-dot" />,
}));

/** A route chunk whose `import()` never settles, so the fallback stays mounted. */
const NeverLoadingPage = lazy(() => new Promise<never>(() => {}));

const preloaderScss = readFileSync(
	path.join(process.cwd(), 'src/components/GlobalAppPreloader/globalAppPreloader.scss'),
	'utf8'
);

/** Body of one `&--<variant>` block from the preloader stylesheet. */
function variantBlock(variant: string): string {
	const start = preloaderScss.indexOf(`&--${variant} {`);
	expect(start).toBeGreaterThan(-1);
	const end = preloaderScss.indexOf('\n\t}', start);
	return preloaderScss.slice(start, end);
}

describe('routeLoadingFallback GPL', () => {
	it('GPL-22: a lazy route fallback does not render the full-viewport bootstrap preloader', () => {
		render(
			<Suspense fallback={<RouteLoadingFallback />}>
				<NeverLoadingPage />
			</Suspense>
		);

		const preloader = screen.getByTestId('global-app-preloader');
		expect(preloader.className).toContain('global-app-preloader--route-fallback');
		expect(preloader.className).not.toContain('global-app-preloader--bootstrap');
		// Bootstrap-only chrome: the oversized brand wordmark stays out of the content area.
		expect(screen.queryByText('Many Faces')).toBeNull();
		expect(document.querySelectorAll('.global-app-preloader__dot')).toHaveLength(0);
		expect(screen.getByTestId('three-dot')).toBeTruthy();
		expect(preloader.getAttribute('aria-label')).toBe('Loading page');
	});

	it('GPL-22: only the bootstrap variant carries the fixed viewport cover', () => {
		const bootstrap = variantBlock('bootstrap');
		expect(bootstrap).toContain('position: fixed');
		expect(bootstrap).toContain('inset: 0');
		expect(bootstrap).toContain('min-height: 100dvh');

		const routeFallback = variantBlock('route-fallback');
		expect(routeFallback).toContain('position: static');
		expect(routeFallback).not.toContain('position: fixed');
		expect(routeFallback).not.toContain('100dvh');
		// Mini tokens from preloaderTokens.ts (ROUTE_FALLBACK_*).
		expect(routeFallback).toContain('--gpl-logo: 64px');
	});
});
