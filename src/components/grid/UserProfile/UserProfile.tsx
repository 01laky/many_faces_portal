/**
 * UserProfile - First face profile in directory (non-host users, API-backed)
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import {
	fetchAllFaceProfilesForFace,
	type FaceProfileListItem,
} from '../../../api/services/faceProfilesApi';
import { profileAvatarUrl } from '../gridDisplayHelpers';
import './UserProfile.scss';

export function UserProfile() {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const getLocalizedPath = useLocalizedLink();
	const faceId = selectedFace?.id;
	const faceIndex = selectedFace?.index;

	const [profile, setProfile] = useState<FaceProfileListItem | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			await Promise.resolve();
			if (faceId == null || !token) {
				if (!cancelled) {
					setLoading(false);
					setProfile(null);
				}
				return;
			}
			if (!cancelled) setLoading(true);
			try {
				const list = await fetchAllFaceProfilesForFace(faceId, token);
				if (!cancelled) setProfile(list[0] ?? null);
			} catch {
				if (!cancelled) setProfile(null);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [faceId, token]);

	if (faceId == null || !faceIndex) {
		return (
			<div className="userprofile-component userprofile-component--message">
				<p>{t(k.selectFaceProfiles)}</p>
			</div>
		);
	}

	if (!token) {
		return (
			<div className="userprofile-component userprofile-component--message">
				<p>{t(k.guest.profiles)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="userprofile-component userprofile-component--message">
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="userprofile-component userprofile-component--message">
				<p>{t(k.empty.profilesFace)}</p>
			</div>
		);
	}

	const name = profile.displayName?.trim() || t(k.profileCardRoleMember);
	const href = getLocalizedPath(`${faceIndex}/profile/${encodeURIComponent(profile.userId)}`);

	return (
		<Link className="userprofile-component userprofile-component--link" to={href}>
			<img
				className="userprofile-avatar"
				src={profileAvatarUrl(profile.userId, profile.avatarUrl)}
				alt={name}
				loading="lazy"
			/>
			<div className="userprofile-info">
				<span className="userprofile-name">{name}</span>
				<span className="userprofile-role">{t(k.profileRoleMember)}</span>
				<span className="userprofile-bio">{t(k.profileBioHint)}</span>
			</div>
		</Link>
	);
}
