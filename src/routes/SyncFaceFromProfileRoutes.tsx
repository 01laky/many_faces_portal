import { useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFaceConfig } from '../contexts/FaceConfigContext';

/** Keeps URL `:faceIndex` in sync with `FaceConfigContext` for profile / stories routes. */
export function SyncFaceFromProfileRoutes({ children }: { children: ReactNode }) {
	const { t } = useTranslation('common');
	const location = useLocation();
	const navigate = useNavigate();
	const { selectedFace, availableFaces, selectFace, isLoading } = useFaceConfig();

	useEffect(() => {
		if (isLoading) return;
		const parts = location.pathname.split('/').filter(Boolean);
		if (parts.length < 3) return;
		const lang = parts[0];
		const urlFaceIdx = parts[1];
		const rest = parts.slice(2).join('/');
		const faceMatch = availableFaces.find(
			(f) => f.index.toLowerCase() === urlFaceIdx.toLowerCase()
		);
		if (faceMatch) {
			if (selectedFace?.id !== faceMatch.id) selectFace(faceMatch.id);
			return;
		}
		if (selectedFace && rest) {
			navigate(`/${lang}/${selectedFace.index}/${rest}`, { replace: true });
		} else if (selectedFace) {
			navigate(`/${lang}/${selectedFace.index}/profiles`, { replace: true });
		}
	}, [location.pathname, availableFaces, selectedFace, selectFace, navigate, isLoading]);

	if (isLoading || !selectedFace) {
		return <div style={{ padding: 24 }}>{t('faceProfiles.loading')}</div>;
	}

	const parts = location.pathname.split('/').filter(Boolean);
	if (parts.length >= 3) {
		const urlFaceIdx = parts[1];
		if (urlFaceIdx.toLowerCase() !== selectedFace.index.toLowerCase()) {
			return <div style={{ padding: 24 }}>{t('faceProfiles.syncingFace')}</div>;
		}
	}

	return <>{children}</>;
}
