import { describe, it, expect } from 'vitest';
import { storiesListRelativePath } from '../api/services/storiesApi';

describe('storiesListRelativePath', () => {
	it('prefixes face index', () => {
		expect(storiesListRelativePath('basic')).toBe('/basic/stories');
	});
});
