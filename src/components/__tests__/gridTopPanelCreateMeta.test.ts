import { describe, expect, it } from 'vitest';
import { gridTopPanelHeaderTitle } from '../gridTopPanelCreateMeta';

describe('gridTopPanelCreateMeta', () => {
	it('builds create header from component type label', () => {
		expect(gridTopPanelHeaderTitle({ componentType: 'album' })).toBe('Create Album');
		expect(gridTopPanelHeaderTitle({ componentType: 'blogGrid' })).toBe('Create Blog');
		expect(gridTopPanelHeaderTitle({ componentType: 'storyCarousel' })).toBe('Create Stories');
	});
});
