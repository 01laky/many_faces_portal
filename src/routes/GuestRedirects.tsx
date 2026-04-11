import type { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { HomePage } from '../pages/HomePage';

/** Guest: /:lang → /:lang/:face/home so URL always has a face prefix. */
export function GuestRedirectToFaceHome() {
  const { lang } = useParams<{ lang: string }>();
  const { selectedFace, getFaceHomePath } = useFaceConfig();
  if (!selectedFace) return <HomePage />;
  return <Navigate to={`/${lang}${getFaceHomePath()}`} replace />;
}

/** Guest: /:lang/login (translated) → /:lang/:face/login. */
export function GuestRedirectToFacePath({
  subPath,
  fallback,
}: {
  subPath: string;
  fallback: ReactNode;
}) {
  const { lang } = useParams<{ lang: string }>();
  const { selectedFace } = useFaceConfig();
  if (!selectedFace) return <>{fallback}</>;
  return <Navigate to={`/${lang}/${selectedFace.index}/${subPath}`} replace />;
}
