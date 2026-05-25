import { useTranslation } from 'react-i18next';

export function UserContentSectionPlaceholder({ sectionKey }: { sectionKey: string }) {
	const { t } = useTranslation('common');
	return (
		<section className="face-profile-detail-page__section">
			<p className="face-profile-detail-page__muted">
				{t(`profileDetail.${sectionKey}.empty`, { defaultValue: '' })}
			</p>
		</section>
	);
}
