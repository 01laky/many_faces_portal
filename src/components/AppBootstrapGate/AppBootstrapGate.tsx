import type { ReactNode } from 'react';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useAppBootstrapReady } from '../../hooks/useAppBootstrapReady';
import { GlobalAppPreloader } from '../GlobalAppPreloader';
import { GlobalAppBootstrapError } from './GlobalAppBootstrapError';

export function AppBootstrapGate({ children }: { children: ReactNode }) {
	const faceConfig = useFaceConfig();
	const state = useAppBootstrapReady({
		faceConfig: { isLoading: faceConfig.isLoading, error: faceConfig.error },
	});

	if (state.error) {
		return (
			<GlobalAppBootstrapError
				title="Failed to load routes configuration"
				message={state.error.message}
				onRetry={() => void faceConfig.reload()}
			/>
		);
	}

	if (!state.isReady) {
		return <GlobalAppPreloader />;
	}

	return children;
}
