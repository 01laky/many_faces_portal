import { useTranslation } from 'react-i18next';
import { UserCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { likeFaceProfile, unlikeFaceProfile } from '../../../api/services/faceProfilesApi';
import { useFaceMemberDetail } from '../context/useFaceMemberDetail';

interface ProfileHeroSectionProps {
	includeMeta?: boolean;
	includeLike?: boolean;
}

export function ProfileHeroSection({
	includeMeta = true,
	includeLike = true,
}: ProfileHeroSectionProps) {
	const { t } = useTranslation('common');
	const { faceId, userId, detail, token, isSelf, refreshAll } = useFaceMemberDetail();

	const handleLike = async () => {
		if (!token) return;
		try {
			if (detail.likedByMe) await unlikeFaceProfile(faceId, userId, token);
			else await likeFaceProfile(faceId, userId, token);
			await refreshAll();
		} catch {
			toast.error(t('faceProfiles.likeError'));
		}
	};

	return (
		<div className="face-profile-detail-page__hero">
			<div className="face-profile-detail-page__avatar">
				{detail.avatarUrl ? (
					<img src={detail.avatarUrl} alt="" />
				) : (
					<UserCircle size={96} strokeWidth={1.25} />
				)}
			</div>
			<h1>{detail.displayName || detail.nickname || userId}</h1>
			{includeMeta && (
				<dl className="face-profile-detail-page__meta">
					<div>
						<dt>{t('faceProfiles.nickname')}</dt>
						<dd>{detail.nickname ?? '—'}</dd>
					</div>
					<div>
						<dt>{t('faceProfiles.age')}</dt>
						<dd>{detail.age ?? '—'}</dd>
					</div>
					<div>
						<dt>{t('faceProfiles.rod')}</dt>
						<dd>{detail.rod ?? '—'}</dd>
					</div>
					<div>
						<dt>{t('faceProfiles.created')}</dt>
						<dd>{new Date(detail.createdAt).toLocaleString()}</dd>
					</div>
				</dl>
			)}
			{includeLike && token && !isSelf && (
				<button
					type="button"
					className="face-profile-detail-page__like"
					onClick={() => void handleLike()}
				>
					{detail.likedByMe ? t('faceProfiles.unlike') : t('faceProfiles.like')}
				</button>
			)}
		</div>
	);
}
