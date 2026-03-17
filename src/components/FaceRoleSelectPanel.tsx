/**
 * Top panel shown on first visit to a private face so the user can choose their face role.
 * Once they confirm, the choice is stored in localStorage and the panel is not shown again.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getFaceRoles, setMyFaceRole } from '../api/services/FaceRolesService';
import type { FaceRoleOption } from '../api/types/facesConfig';
import type { FaceConfig } from '../api/types/facesConfig';
import './FaceRoleSelectPanel.scss';

const STORAGE_PREFIX = 'face_role_chosen_';

interface FaceRoleSelectPanelProps {
  /** Current private face */
  face: FaceConfig;
  token: string;
  onRoleSet: () => void;
}

export function FaceRoleSelectPanel({ face, token, onRoleSet }: FaceRoleSelectPanelProps) {
  const { t } = useTranslation('common');
  const [roles, setRoles] = useState<FaceRoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(face.myFaceRoleId ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFaceRoles()
      .then((list) => {
        if (!cancelled) {
          setRoles(list);
          setSelectedRoleId((prev) => {
            if (prev) return prev;
            const currentId = face.myFaceRoleId;
            if (currentId && list.some((r) => r.id === currentId)) return currentId;
            return list[0]?.id ?? 0;
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError(t('faceRoleSelect.loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [face.myFaceRoleId, t]);

  const handleConfirm = async () => {
    if (!selectedRoleId || saving) return;
    setSaving(true);
    setError(null);
    try {
      await setMyFaceRole(face.id, selectedRoleId, token);
      localStorage.setItem(`${STORAGE_PREFIX}${face.id}`, '1');
      onRoleSet();
    } catch {
      setError(t('faceRoleSelect.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="face-role-select-panel">
        <div className="face-role-select-panel__inner">
          <span className="face-role-select-panel__loading">{t('faceRoleSelect.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="face-role-select-panel">
      <div className="face-role-select-panel__inner">
        <span className="face-role-select-panel__label">{t('faceRoleSelect.chooseRole')}</span>
        <select
          className="face-role-select-panel__select"
          value={selectedRoleId || ''}
          onChange={(e) => setSelectedRoleId(Number(e.target.value))}
          disabled={saving}
          aria-label={t('faceRoleSelect.chooseRole')}
        >
          {!selectedRoleId && <option value="">{t('faceRoleSelect.selectPlaceholder')}</option>}
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="face-role-select-panel__btn"
          onClick={handleConfirm}
          disabled={!selectedRoleId || saving}
        >
          {saving ? t('faceRoleSelect.saving') : t('faceRoleSelect.confirm')}
        </button>
        {error && <span className="face-role-select-panel__error">{error}</span>}
      </div>
    </div>
  );
}

// Helper used by App.tsx; separate export to satisfy react-refresh/only-export-components
// eslint-disable-next-line react-refresh/only-export-components
export function shouldShowFaceRolePanel(face: FaceConfig | null): boolean {
  if (!face || face.isPublic) return false;
  return !localStorage.getItem(`${STORAGE_PREFIX}${face.id}`);
}
