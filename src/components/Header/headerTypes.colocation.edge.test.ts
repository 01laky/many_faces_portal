import { describe, expect, it } from 'vitest';
import type { HeaderProps } from './types';

describe('Header colocated props type', () => {
	it('allows optional panel and menu callbacks', () => {
		const props: HeaderProps = {
			onSettingsToggle: () => undefined,
			onMenuToggle: () => undefined,
			onProfileClick: () => undefined,
		};
		expect(typeof props.onSettingsToggle).toBe('function');
	});

	it('allows story and wall ticket create handlers', () => {
		const calls: string[] = [];
		const props: HeaderProps = {
			onStoriesCreate: () => calls.push('stories'),
			onWallTicketCreate: () => calls.push('wall'),
		};
		props.onStoriesCreate?.();
		props.onWallTicketCreate?.();
		expect(calls).toEqual(['stories', 'wall']);
	});

	it('permits empty props when no header actions are wired', () => {
		const props: HeaderProps = {};
		expect(props.onProfileClick).toBeUndefined();
	});
});
