import { MainLogo } from '../MainLogo/MainLogo';
import './globalAppBootstrapError.scss';

import type { GlobalAppBootstrapErrorProps } from './types';

/** Branded bootstrap failure — logo + message; no animated spinner. */
export function GlobalAppBootstrapError({
	title,
	message,
	onRetry,
	retryLabel = 'Retry',
}: GlobalAppBootstrapErrorProps) {
	return (
		<div
			className="global-app-bootstrap-error"
			role="alert"
			data-testid="global-app-bootstrap-error"
		>
			<div className="global-app-bootstrap-error__logo">
				<MainLogo />
			</div>
			<h1 className="global-app-bootstrap-error__title">{title}</h1>
			<p className="global-app-bootstrap-error__message">{message}</p>
			{onRetry ? (
				<button type="button" className="global-app-bootstrap-error__retry" onClick={onRetry}>
					{retryLabel}
				</button>
			) : null}
		</div>
	);
}
