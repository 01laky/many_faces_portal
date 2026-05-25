import * as Select from '@radix-ui/react-select';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApp, supportedLanguages } from '../../contexts/AppContext';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../../i18n/constants';
import { getEnglishRoute, getTranslatedRoute } from '../../utils/routeTranslations';
import './LanguageSwitcher.scss';

export function LanguageSwitcher() {
	const { currentLanguage, changeLanguage, t } = useApp();
	const { t: i18nT } = useTranslation('common');
	const navigate = useNavigate();
	const { lang } = useParams<{ lang: string }>();
	const location = useLocation();

	// Use language from URL if available, otherwise from context
	const displayLanguage = (lang as SupportedLanguage) || currentLanguage;

	const handleLanguageChange = (newLang: string) => {
		void (async () => {
			const langCode = newLang as SupportedLanguage;

			await changeLanguage(langCode);

			// Update URL to reflect new language while preserving and translating current path
			const currentPath = location.pathname;

			// Extract path without language prefix
			// Examples: /en -> '', /en/login -> /login, /sk/prihlasenie -> /prihlasenie
			let pathWithoutLang = currentPath;

			// Remove language prefix if it exists (e.g., /en, /sk, /cz)
			for (const supportedLang of supportedLanguages) {
				if (currentPath.startsWith(`/${supportedLang}`)) {
					pathWithoutLang = currentPath.slice(`/${supportedLang}`.length);
					break;
				}
			}

			// If path is empty or just '/', it means we're on the home page
			if (pathWithoutLang === '' || pathWithoutLang === '/') {
				navigate(`/${langCode}`, { replace: true });
				return;
			}

			// Remove leading slash from path
			const cleanPath = pathWithoutLang.startsWith('/')
				? pathWithoutLang.slice(1)
				: pathWithoutLang;

			// Get English route name from current translated path
			const currentLang = (lang as SupportedLanguage) || currentLanguage;
			const englishRoute = getEnglishRoute(cleanPath, currentLang, (key: string) => {
				return i18nT(key, { lng: currentLang });
			});

			// Translate to new language
			const translatedPath = getTranslatedRoute(englishRoute, langCode, (key: string) => {
				return i18nT(key, { lng: langCode });
			});

			// Navigate to new language with translated path
			navigate(`/${langCode}${translatedPath ? `/${translatedPath}` : ''}`, { replace: true });
		})();
	};

	return (
		<Select.Root value={displayLanguage} onValueChange={handleLanguageChange}>
			<Select.Trigger className="language-select-trigger" aria-label={t('language.select')}>
				<Select.Value />
				<Select.Icon className="language-select-icon">
					<svg
						width="15"
						height="15"
						viewBox="0 0 15 15"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.94999 7.49999 9.94999C7.38064 9.94999 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
							fill="currentColor"
							fillRule="evenodd"
							clipRule="evenodd"
						/>
					</svg>
				</Select.Icon>
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className="language-select-content" position="popper">
					<Select.Viewport className="language-select-viewport">
						{supportedLanguages.map((langCode) => (
							<Select.Item key={langCode} value={langCode} className="language-select-item">
								<Select.ItemText>{t(`language.${langCode}`)}</Select.ItemText>
								<Select.ItemIndicator className="language-select-indicator">
									<svg
										width="15"
										height="15"
										viewBox="0 0 15 15"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
											fill="currentColor"
											fillRule="evenodd"
											clipRule="evenodd"
										/>
									</svg>
								</Select.ItemIndicator>
							</Select.Item>
						))}
					</Select.Viewport>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	);
}
