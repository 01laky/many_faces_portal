import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import type { GuestRouteProps } from './types';

/**
 * GuestRoute - Redirects authenticated users to homepage
 * Used for routes that should only be accessible to unauthenticated users (login, register, home)
 */
export function GuestRoute({ children }: GuestRouteProps) {
	const { isAuthenticated } = useAuth();
	const { getPostAuthHomePath } = useFaceConfig();
	const getLocalizedPath = useLocalizedLink();

	if (isAuthenticated) {
		return <Navigate to={getLocalizedPath(getPostAuthHomePath())} replace />;
	}

	// If user is not authenticated, show the route
	return <>{children}</>;
}
