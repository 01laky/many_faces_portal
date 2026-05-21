import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchFaceProfile,
  fetchFaceProfileComments,
  fetchFaceProfileReviews,
  type FaceProfileDetail,
  type FaceProfileCommentRow,
  type FaceProfileReviewRow,
} from '../../api/services/faceProfilesApi';
import { FaceMemberDetailProvider } from '../../features/profileDetail/context/FaceMemberDetailProvider';
import { ProfilePageGridLayout } from '../../features/profileDetail/layout/ProfilePageGridLayout';
import { DEFAULT_PROFILE_DETAIL_GRID_SCHEMA_JSON } from '../../features/profileDetail/schema/defaultProfileDetailSchema';
import { parseProfileDetailGridSchema } from '../../features/profileDetail/schema/parseProfileDetailGridSchema';
import './FaceProfileDetailPage.scss';

const PROFILE_DETAIL_PAGE_TYPE = 'profileDetail';

export function FaceProfileDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation('common');
  const { selectedFace } = useFaceConfig();
  const { token, user } = useAuth();
  const [detail, setDetail] = useState<FaceProfileDetail | null>(null);
  const [comments, setComments] = useState<FaceProfileCommentRow[]>([]);
  const [reviews, setReviews] = useState<FaceProfileReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const uid = userId ? decodeURIComponent(userId) : '';

  const load = useCallback(async () => {
    await Promise.resolve();
    if (!selectedFace || !uid) return;
    setLoading(true);
    try {
      const d = await fetchFaceProfile(selectedFace.id, uid, token ?? undefined);
      setDetail(d);
      const c = await fetchFaceProfileComments(selectedFace.id, uid, token ?? undefined);
      setComments(c);
      const r = await fetchFaceProfileReviews(selectedFace.id, uid, token ?? undefined);
      setReviews(r);
    } catch {
      toast.error(t('faceProfiles.loadError'));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [selectedFace, uid, token, t]);

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await load();
    })();
  }, [load]);

  const templatePage = useMemo(
    () => selectedFace?.pages.find((p) => p.pageType?.index === PROFILE_DETAIL_PAGE_TYPE),
    [selectedFace]
  );

  const gridSchemaJson = templatePage?.gridSchema ?? DEFAULT_PROFILE_DETAIL_GRID_SCHEMA_JSON;
  const parsedGrid = useMemo(() => parseProfileDetailGridSchema(gridSchemaJson), [gridSchemaJson]);

  if (!selectedFace || !uid) return null;

  const isSelf = user?.id === uid;

  return (
    <div className="face-profile-detail-page">
      {loading && <p>{t('faceProfiles.loading')}</p>}

      {!loading && detail && parsedGrid.ok && (
        <FaceMemberDetailProvider
          value={{
            faceId: selectedFace.id,
            faceIndex: selectedFace.index,
            userId: uid,
            detail,
            comments,
            reviews,
            token: token ?? undefined,
            isSelf,
            refreshAll: load,
          }}
        >
          <ProfilePageGridLayout schema={parsedGrid.schema} />
        </FaceMemberDetailProvider>
      )}

      {!loading && detail && !parsedGrid.ok && (
        <p className="face-profile-detail-page__muted" role="alert">
          {t('profileDetail.sectionError')}
        </p>
      )}
    </div>
  );
}
