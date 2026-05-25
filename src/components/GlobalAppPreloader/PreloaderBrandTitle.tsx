import { APP_BRAND_DISPLAY_NAME } from './appBrandDisplayName';
import './preloaderBrandTitle.scss';

/** “Many Faces” under the kitsune mask during bootstrap. */
export function PreloaderBrandTitle() {
	return (
		<p className="global-app-preloader__title app-brand-font" aria-hidden="true">
			{APP_BRAND_DISPLAY_NAME}
		</p>
	);
}
