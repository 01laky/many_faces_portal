import { MAIN_LOGO_RASTER_URL } from './logoRaster';
import './MainLogo.scss';

export interface MainLogoProps {
	/** Square render size — inline so size is stable before SCSS loads. */
	sizePx?: number;
}

/** Raster from `public/logo-raster-source.png` (matches mobile; regenerate via `yarn icons:export`). */
export function MainLogo({ sizePx }: MainLogoProps = {}) {
	const boxStyle = sizePx != null ? ({ width: sizePx, height: sizePx } as const) : undefined;
	const imgSize = sizePx != null ? { width: sizePx, height: sizePx } : undefined;

	return (
		<div className="main-logo" style={boxStyle}>
			<img src={MAIN_LOGO_RASTER_URL} alt="" {...imgSize} />
		</div>
	);
}
