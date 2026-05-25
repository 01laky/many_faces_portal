import { useTranslation } from 'react-i18next';

export function ProfileUnknownSection({ sectionType }: { sectionType: string }) {
	const { t } = useTranslation('common');
	return (
		<p className="face-profile-detail-page__muted" role="status">
			{t('profileDetail.unknownSection', { sectionType })}
		</p>
	);
}
