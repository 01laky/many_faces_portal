import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('i18next', () => {
	const i18nInstance = {
		isInitialized: false,
		options: {} as Record<string, unknown>,
		use: vi.fn(function (this: typeof i18nInstance) {
			return {
				init: vi.fn(async (config: Record<string, unknown>) => {
					Object.assign(i18nInstance.options, config);
					i18nInstance.isInitialized = true;
				}),
			};
		}),
		hasResourceBundle: vi.fn(() => false),
		addResourceBundle: vi.fn(),
		changeLanguage: vi.fn(async () => undefined),
	};
	return { default: i18nInstance };
});

vi.mock('react-i18next', () => ({
	initReactI18next: {},
}));

const bundle = {
	version: '1',
	resources: {
		en: { common: { hello: 'Hello' } },
		sk: { common: { hello: 'Ahoj' } },
		de: { common: { hello: 'Hallo' } },
	},
};

vi.mock('@/i18n/fetchLocalizationBundle', () => ({
	fetchLocalizationBundle: vi.fn(async () => bundle),
}));

describe('i18n active language bootstrap (PT-RP18)', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('PT-RP18-U1: cold start registers at most active + en', async () => {
		const i18n = (await import('@/i18n/config')).default;
		const { initI18n } = await import('@/i18n/config');
		await initI18n();
		const langs = new Set(
			(i18n.addResourceBundle as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0])
		);
		expect(langs.has('en')).toBe(true);
		expect(langs.size).toBeLessThanOrEqual(2);
		expect(langs.has('de')).toBe(false);
	});

	it('PT-RP18-U3: missing key falls back via i18n config (fallbackLng en)', async () => {
		const { initI18n } = await import('@/i18n/config');
		await initI18n();
		const i18n = (await import('@/i18n/config')).default;
		expect(i18n.options?.fallbackLng).toBe('en');
	});
});
