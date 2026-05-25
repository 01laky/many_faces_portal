import { useTranslation } from 'react-i18next';
import '../../pages/ComponentListPage/ComponentListPage.scss';
import { COMPONENT_CONFIG } from './componentConfig';

/** ComponentTypeId enum matching BE ComponentTypeId. */

export function ComponentListView({ componentTypeId }: { componentTypeId: number }) {
	const { t } = useTranslation('common');
	const config = COMPONENT_CONFIG[componentTypeId];

	if (!config) {
		return (
			<div className="component-list-page component-list-page--error">
				<p>{t('componentList.notFound', 'Component not found')}</p>
			</div>
		);
	}

	return (
		<div className="component-list-page">
			<div className="component-list-grid">{config.grid()}</div>
		</div>
	);
}
