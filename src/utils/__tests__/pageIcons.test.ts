import { describe, expect, it } from 'vitest';
import { FileBox, FileText, Home, LogIn, Settings, UserPlus } from 'lucide-react';
import { getPageIcon } from '../pageIcons';

describe('getPageIcon', () => {
	it('prefers pageType index over name heuristics', () => {
		expect(getPageIcon('Something', '/other', 'home')).toBe(Home);
		expect(getPageIcon('Something', '/other', 'wall')).toBe(FileText);
		expect(getPageIcon('Something', '/other', 'static')).toBe(FileBox);
	});

	it('falls back to name and path keywords', () => {
		expect(getPageIcon('Login page', '/auth/login')).toBe(LogIn);
		expect(getPageIcon('Register', '/register')).toBe(UserPlus);
		expect(getPageIcon('App settings', '/settings')).toBe(Settings);
		expect(getPageIcon('Community wall', '/wall')).toBe(FileText);
	});

	it('returns FileBox as default', () => {
		expect(getPageIcon('About', '/about')).toBe(FileBox);
	});
});
