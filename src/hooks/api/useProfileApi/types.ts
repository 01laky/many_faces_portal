import type { SupportedLanguage } from '@/i18n/constants';

export interface UpdateProfileData {
	firstName?: string | null;
	lastName?: string | null;
	enableAnimatedGradient?: boolean;
	preferredUiLanguage?: SupportedLanguage | null;
	lastSelectedFaceId?: number | null;
	clearPreferredUiLanguage?: boolean;
	clearLastSelectedFaceId?: boolean;
}
