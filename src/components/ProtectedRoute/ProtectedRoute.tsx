import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * ProtectedRoute component - requires authentication to access
 * Redirects to login page if user is not authenticated
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();

  if (!isAuthenticated) {
    // Save the attempted location to redirect back after login
    const currentPath = location.pathname;
    return <Navigate to={`/${lang || 'en'}/login`} state={{ from: currentPath }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
