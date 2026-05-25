import './globalAppPreloader.scss';

/** CSS three-dot spinner — matches vanilla pre-React shell (no layout shift from ThreeDot). */
export function PreloaderDots() {
	return (
		<div className="global-app-preloader__dots" aria-hidden="true">
			<span className="global-app-preloader__dot" />
			<span className="global-app-preloader__dot" />
			<span className="global-app-preloader__dot" />
		</div>
	);
}
