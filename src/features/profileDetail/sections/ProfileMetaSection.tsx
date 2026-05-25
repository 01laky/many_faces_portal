import { useTranslation } from 'react-i18next';
import { useFaceMemberDetail } from '../context/useFaceMemberDetail';

export function ProfileMetaSection() {
	const { t } = useTranslation('common');
	const { detail } = useFaceMemberDetail();

	return (
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
	);
}
