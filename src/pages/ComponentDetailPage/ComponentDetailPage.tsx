import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { ChatRoomDetailPage } from '../ChatRoomDetailPage';
import { VideoLoungeDetailPage } from '../VideoLoungeDetailPage';

/**
 * Unified detail route: `/detail/:componentTypeId/:entityId`
 * Dispatches by component type id (matches backend `ComponentTypeId`).
 */
export function ComponentDetailPage() {
  const { componentTypeId, entityId } = useParams<{
    componentTypeId: string;
    entityId: string;
  }>();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const typeId = Number(componentTypeId);
  const entity = Number(entityId);

  const handleBack = () => navigate(-1);

  if (!Number.isFinite(typeId) || !Number.isFinite(entity)) {
    return (
      <div style={{ padding: 24 }}>
        <button type="button" onClick={handleBack} style={{ marginBottom: 12 }}>
          <ArrowLeft size={18} style={{ verticalAlign: 'middle' }} /> {t('common.back', 'Back')}
        </button>
        <p>{t('componentDetail.invalid', 'Invalid link.')}</p>
      </div>
    );
  }

  if (typeId === 4) {
    return <ChatRoomDetailPage roomId={entity} />;
  }

  if (typeId === 8) {
    return <VideoLoungeDetailPage loungeId={entity} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <button type="button" onClick={handleBack} style={{ marginBottom: 12 }}>
        <ArrowLeft size={18} style={{ verticalAlign: 'middle' }} /> {t('common.back', 'Back')}
      </button>
      <p>{t('componentDetail.notImplemented', 'This detail type is not implemented yet.')}</p>
    </div>
  );
}
