import { MainLogo } from '../MainLogo/MainLogo';
import './globalAppBootstrapError.scss';

export interface GlobalAppBootstrapErrorProps {
	title: string;
	message: string;
	onRetry?: () => void;
	retryLabel?: string;
}

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
