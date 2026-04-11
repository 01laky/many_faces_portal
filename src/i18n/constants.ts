/** Supported UI languages (URL segment + i18n bundles). */
export const supportedLanguages = ['en', 'sk', 'cz'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
