/** Supported UI languages (URL segment + i18n bundles). */
export const supportedLanguages = ['en', 'sk', 'cz', 'de', 'fr', 'it'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
