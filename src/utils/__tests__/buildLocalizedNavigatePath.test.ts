/**
 * Covers imperative navigation targets: language precedence (`lang` route param vs `currentLanguage`),
 * slash normalization, and preservation of query/hash fragments inside the logical path string.
 */
import { describe, it, expect } from 'vitest';
import { buildLocalizedNavigateTarget } from '../buildLocalizedNavigatePath';

describe('buildLocalizedNavigateTarget', () => {
	it('uses lang from URL when present', () => {
		expect(buildLocalizedNavigateTarget('profile/edit', 'sk', 'en')).toBe('/sk/profile/edit');
	});

	it('falls back to currentLanguage when lang missing', () => {
		expect(buildLocalizedNavigateTarget('chat', undefined, 'cz')).toBe('/cz/chat');
	});

	it('strips leading slash', () => {
		expect(buildLocalizedNavigateTarget('/foo/bar', 'en', 'en')).toBe('/en/foo/bar');
	});

	it('preserves query and hash in path string', () => {
		expect(buildLocalizedNavigateTarget('search?q=1#frag', 'en', 'en')).toBe('/en/search?q=1#frag');
	});
});
