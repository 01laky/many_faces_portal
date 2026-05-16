import { useParams, useNavigate } from 'react-router-dom';
import { ComponentListView } from '../../components/ComponentListView';

export function ComponentListPage() {
  const { componentTypeId } = useParams<{ componentTypeId: string }>();
  const navigate = useNavigate();
  const id = Number(componentTypeId);

  return <ComponentListView componentTypeId={id} onBack={() => navigate(-1)} />;
}
