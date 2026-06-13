import { describe, it, expect } from 'vitest';
import {
	buildVanillaPreloaderHtml,
	buildVanillaPreloaderHeadStyle,
} from '../globalPreloaderVanillaShell';

/**
 * Edge-case coverage for the pre-React vanilla preloader shell (previously untested). Asserts the
 * accessible status markup, the exact three-dot spinner, the reduced-motion guard, and that the
 * head-style helper emits CSS only (no markup).
 */

describe('globalPreloaderVanillaShell', () => {
	it('builds an accessible status shell with a style block and three spinner dots', () => {
		const html = buildVanillaPreloaderHtml();
		expect(html).toContain('<style>');
		expect(html).toContain('class="global-app-preloader-vanilla"');
		expect(html).toContain('role="status"');
		expect(html).toContain('aria-busy="true"');
		// Exactly three dot spans (the container class `__dots"` and CSS `__dot{`/`:nth-child` do not match `__dot"`).
		const dots = html.match(/global-app-preloader-vanilla__dot"/g) ?? [];
		expect(dots).toHaveLength(3);
	});

	it('hides the dots under prefers-reduced-motion', () => {
		const html = buildVanillaPreloaderHtml();
		expect(html).toContain('@media (prefers-reduced-motion:reduce)');
		expect(html).toContain('visibility:hidden');
	});

	it('head-style helper returns CSS only, without the markup wrapper', () => {
		const css = buildVanillaPreloaderHeadStyle();
		expect(css).toContain('global-app-preloader-vanilla');
		expect(css).toContain('@keyframes global-preloader-bounce');
		expect(css).not.toContain('role="status"');
		expect(css).not.toContain('<div');
	});
});
