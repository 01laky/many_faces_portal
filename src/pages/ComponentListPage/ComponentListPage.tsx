import { useParams } from 'react-router-dom';
import { ComponentListView } from '../../components/ComponentListView';

export function ComponentListPage() {
	const { componentTypeId } = useParams<{ componentTypeId: string }>();
	const id = Number(componentTypeId);

	return <ComponentListView componentTypeId={id} />;
}
