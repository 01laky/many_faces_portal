import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import {
  createAlbum,
  updateAlbum,
  type AlbumItem,
  type CreateAlbumDto,
} from '../../../api/services/AlbumsService';
import { getSubmittedForApprovalCopy } from '../../../utils/contentModeration';
import './AlbumForm.scss';

interface AlbumFormProps {
  editAlbum?: AlbumItem | null;
  onSaved?: (album: AlbumItem) => void;
  onCancel?: () => void;
}

const ALBUM_TYPES = [
  { value: 1, label: 'Public' },
  { value: 2, label: 'Private' },
  { value: 3, label: 'Paid' },
];

const MEDIA_TYPES = [
  { value: 1, label: 'Image' },
  { value: 2, label: 'Video' },
];

export function AlbumForm({ editAlbum, onSaved, onCancel }: AlbumFormProps) {
  const { t } = useTranslation('common');
  const { token } = useAuth();
  const { allFaces, selectedFace } = useFaceConfig();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [albumType, setAlbumType] = useState(1);
  const [mediaType, setMediaType] = useState(1);
  const [selectedFaceIds, setSelectedFaceIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEdit = !!editAlbum;

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      if (editAlbum) {
        setTitle(editAlbum.title);
        setDescription(editAlbum.description ?? '');
        setAlbumType(editAlbum.albumType);
        setMediaType(editAlbum.mediaType);
        setSelectedFaceIds(editAlbum.faces.map((f) => f.faceId));
      } else {
        setTitle('');
        setDescription('');
        setAlbumType(1);
        setMediaType(1);
        setSelectedFaceIds(selectedFace ? [selectedFace.id] : []);
      }
    })();
  }, [editAlbum, selectedFace]);

  const toggleFace = (faceId: number) => {
    setSelectedFaceIds((prev) =>
      prev.includes(faceId) ? prev.filter((id) => id !== faceId) : [...prev, faceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim()) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const dto: CreateAlbumDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        albumType,
        mediaType,
        faceIds: selectedFaceIds,
      };

      let result: AlbumItem;
      if (isEdit) {
        result = await updateAlbum(editAlbum!.id, dto, token);
      } else {
        result = await createAlbum(dto, token);
        setSuccess(getSubmittedForApprovalCopy('album'));
      }
      onSaved?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save album');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="album-form" onSubmit={handleSubmit}>
      <h3 className="album-form-heading">{isEdit ? 'Edit Album' : 'Create Album'}</h3>

      {error && <div className="album-form-error">{error}</div>}
      {success && <div className="album-form-success">{success}</div>}

      <label className="album-form-label">
        Title
        <input
          type="text"
          className="album-form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Album title"
          maxLength={200}
          required
        />
      </label>

      <label className="album-form-label">
        Description
        <textarea
          className="album-form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          maxLength={2000}
          rows={3}
        />
      </label>

      <label className="album-form-label">
        Album Type
        <select
          className="album-form-select"
          value={albumType}
          onChange={(e) => setAlbumType(Number(e.target.value))}
        >
          {ALBUM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="album-form-label">
        Media Type
        <select
          className="album-form-select"
          value={mediaType}
          onChange={(e) => setMediaType(Number(e.target.value))}
        >
          {MEDIA_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="album-form-fieldset">
        <legend>{t(k.formFacesLegend)}</legend>
        <div className="album-form-faces">
          {allFaces.map((face) => (
            <label key={face.id} className="album-form-face-option">
              <input
                type="checkbox"
                checked={selectedFaceIds.includes(face.id)}
                onChange={() => toggleFace(face.id)}
              />
              <span>{face.title}</span>
            </label>
          ))}
          {allFaces.length === 0 && <span className="album-form-no-faces">{t(k.formNoFaces)}</span>}
        </div>
      </fieldset>

      <div className="album-form-actions">
        {onCancel && (
          <button
            type="button"
            className="album-form-btn album-form-btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="album-form-btn album-form-btn--save"
          disabled={saving || !title.trim()}
        >
          {saving ? <Loader2 size={16} className="album-form-spinner" /> : <Save size={16} />}
          <span>{isEdit ? 'Update' : 'Create'}</span>
        </button>
      </div>
    </form>
  );
}
