import type { ReactElement, ReactNode } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';

/** DRY wrapper for authenticated route elements (React Router v6 child must stay literal Route). */
export function protectedRouteElement(page: ReactNode): ReactElement {
  return <ProtectedRoute>{page}</ProtectedRoute>;
}
