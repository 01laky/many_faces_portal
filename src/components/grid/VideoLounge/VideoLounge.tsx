/**
 * Single video lounge tile: bound to a specific lounge from grid JSON, or first lounge in the face.
 */

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { COMPONENT_TYPE_ID } from '../../../constants/componentTypeIds';
import {
  getVideoLounge,
  listVideoLounges,
  type FaceVideoLoungeDto,
} from '../../../api/services/VideoLoungesService';
import { VideoLoungeCard } from '../VideoLoungeCard';
import './VideoLounge.scss';

export interface VideoLoungeProps {
  boundVideoLoungeId?: number;
}

export function VideoLounge({ boundVideoLoungeId }: VideoLoungeProps) {
  const { t } = useTranslation('common');
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const [lounge, setLounge] = useState<FaceVideoLoungeDto | null>(null);
  const [loading, setLoading] = useState(true);

  const goDetail = useCallback(
    (id: number) => {
      navigate(getLocalizedPath(`/detail/${COMPONENT_TYPE_ID.videoLounge}/${id}`));
    },
    [navigate, getLocalizedPath]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!selectedFace || !token) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setLoading(true);
      try {
        if (boundVideoLoungeId != null) {
          const r = await getVideoLounge(selectedFace.id, boundVideoLoungeId, token);
          if (!cancelled) setLounge(r);
        } else {
          const list = await listVideoLounges(selectedFace.id, token);
          if (!cancelled) setLounge(list[0] ?? null);
        }
      } catch {
        if (!cancelled) setLounge(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedFace, token, boundVideoLoungeId]);

  if (!selectedFace || !token) {
    return (
      <div className="videolounge-component videolounge-component--empty">
        <span className="videolounge-empty-text">{t(k.guest.videoLounges)}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="videolounge-component videolounge-component--center">
        <Loader2 className="videolounge-loading" size={24} />
      </div>
    );
  }

  if (!lounge) {
    return (
      <div className="videolounge-component videolounge-component--empty">
        <span className="videolounge-empty-text">{t(k.empty.videoLounges)}</span>
      </div>
    );
  }

  return (
    <div className="videolounge-component videolounge-component--tile">
      <VideoLoungeCard lounge={lounge} onOpen={() => goDetail(lounge.id)} />
    </div>
  );
}
