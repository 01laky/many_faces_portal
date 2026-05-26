import { createContext, useContext, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from '../i18n/constants';
import { ensureLanguageLoaded } from '../i18n/config';
import { getAccessTokenFromStorage } from '../utils/authStorage';
import { writeGuestUiLanguage } from '../utils/guestSessionStorage';
import * as profileApi from '../api/profile/profileApi';
import type { AppContextType, AppProviderProps } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: AppProviderProps) {
	const { i18n, t } = useTranslation('common');

	const currentLanguage = (i18n.language as SupportedLanguage) || 'en';

	const changeLanguage = useCallback(
		async (newLang: SupportedLanguage) => {
			await ensureLanguageLoaded(newLang);
			await i18n.changeLanguage(newLang);
			const token = getAccessTokenFromStorage();
			if (token) {
				try {
					await profileApi.updateProfile(token, { preferredUiLanguage: newLang });
				} catch {
					// UI language already changed locally; server sync is best-effort
				}
			} else {
				writeGuestUiLanguage(newLang);
			}
		},
		[i18n]
	);

	const value = useMemo(
		() => ({
			currentLanguage,
			changeLanguage,
			t,
		}),
		[currentLanguage, changeLanguage, t]
	);

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error('useApp must be used within an AppProvider');
	}
	return context;
}

export { supportedLanguages };
