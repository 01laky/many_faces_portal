export interface GlobalAppBootstrapErrorProps {
	title: string;
	message: string;
	onRetry?: () => void;
	retryLabel?: string;
}
