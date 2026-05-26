/*
 * ApiContext.tsx - React context provider for API client with face path routing
 *
 * This context provides an ApiClient instance with:
 * - Face path routing: Automatically prepends face prefix from URL to API requests
 * - Token management: Automatically includes JWT token in requests
 * - Dynamic token updates: Recreates client when token changes
 *
 * Usage:
 *   const { api } = useApi();
 *   // Use api.instance for making requests with face path routing
 */

import * as React from 'react';
import { ApiClient } from '../api/ApiClient';
import { env } from '../config/env';
import type { TApiContextModel, TApiContextProviderProps } from './types';

export type { TApiContextModel, TApiContextProviderProps } from './types';

const defaultApiContextModel: TApiContextModel = {
	api: new ApiClient(null, {}, env.apiUrl),
};

export const ApiContext = React.createContext<TApiContextModel>(defaultApiContextModel);

/**
 * API context provider component
 *
 * Creates and provides ApiClient instance with face path routing.
 * Recreates client when accessToken changes to ensure Authorization header is updated.
 *
 * @param children - Child components that can access API context
 * @param accessToken - JWT token for authentication (optional, can be provided via props or useTokenContext)
 */
export function ApiContextProvider({
	children,
	accessToken: propAccessToken,
}: TApiContextProviderProps): React.ReactElement {
	// Try to get token from prop or from context/hooks if needed
	// For now, we'll use prop token or null
	// In a more sophisticated setup, you might want to integrate with AuthContext
	const accessToken = propAccessToken ?? null;

	// Create ApiClient instance with current token
	// Using useMemo to recreate only when token changes
	const api = React.useMemo(() => {
		const publicIP = env.apiUrl;

		// Create new ApiClient instance with current token
		// This ensures Authorization header is set correctly
		return new ApiClient(accessToken, {}, publicIP);
	}, [accessToken]);

	const apiContextModel = React.useMemo(
		(): TApiContextModel => ({
			api,
		}),
		[api]
	);

	return <ApiContext.Provider value={apiContextModel}>{children}</ApiContext.Provider>;
}

/**
 * Hook to access API context
 *
 * @returns API context with ApiClient instance
 * @throws Error if used outside ApiContextProvider
 */
export function useApi(): TApiContextModel {
	const context = React.useContext(ApiContext);
	if (context === undefined) {
		throw new Error('useApi must be used within ApiContextProvider');
	}
	return context;
}

export default ApiContextProvider;
