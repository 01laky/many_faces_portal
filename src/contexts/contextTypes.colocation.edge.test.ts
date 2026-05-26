import { describe, expect, it } from 'vitest';
import type {
	AppContextType,
	AuthContextType,
	AuthProviderProps,
	AuthUser,
	FaceConfigContextType,
	GridTopPanelState,
	MessengerConnectionState,
} from './types';

describe('context colocated types (§2.13)', () => {
	it('AuthUser allows optional profile fields', () => {
		const minimal: AuthUser = { id: '1', email: 'a@demo.com' };
		const full: AuthUser = {
			id: '2',
			email: 'b@demo.com',
			firstName: 'Bo',
			lastName: 'Portal',
		};
		expect(minimal.firstName).toBeUndefined();
		expect(full.lastName).toBe('Portal');
	});

	it('AuthProviderProps requires children', () => {
		const props: AuthProviderProps = { children: null };
		expect(props.children).toBeNull();
	});

	it('AuthContextType exposes session hydration and login return type', () => {
		const snapshot: Pick<
			AuthContextType,
			'isAuthenticated' | 'isLoading' | 'isSessionHydrated' | 'login'
		> = {
			isAuthenticated: false,
			isLoading: true,
			isSessionHydrated: false,
			login: async () => undefined,
		};
		expect(snapshot.isSessionHydrated).toBe(false);
	});

	it('AppContextType changeLanguage accepts SupportedLanguage union', async () => {
		const calls: string[] = [];
		const ctx: Pick<AppContextType, 'changeLanguage' | 't'> = {
			changeLanguage: async (lang) => {
				calls.push(lang);
			},
			t: (key) => key,
		};
		await ctx.changeLanguage('en');
		await ctx.changeLanguage('sk');
		expect(calls).toEqual(['en', 'sk']);
	});

	it('FaceConfigContextType exposes face lists and reload', () => {
		const snapshot: Pick<FaceConfigContextType, 'allFaces' | 'selectedFace' | 'reload'> = {
			allFaces: [],
			selectedFace: null,
			reload: async () => [],
		};
		expect(snapshot.allFaces).toEqual([]);
	});

	it('GridTopPanelState create mode carries componentType', () => {
		const state: GridTopPanelState = { mode: 'create', componentType: 'story' };
		expect(state?.mode).toBe('create');
	});

	it('MessengerConnectionState covers hub lifecycle', () => {
		const states: MessengerConnectionState[] = ['Connecting', 'Connected', 'Disconnected'];
		expect(new Set(states).size).toBe(3);
	});
});
