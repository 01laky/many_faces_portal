import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { createWallTicket } from '../api/services/wallTicketsApi';
import './WallTicketCreateTopPanel.scss';

interface WallTicketCreateTopPanelProps {
  open: boolean;
  onClose: () => void;
  token: string;
  faceId: number;
  onCreated?: () => void;
}

export function WallTicketCreateTopPanel({
  open,
  onClose,
  token,
  faceId,
  onCreated,
}: WallTicketCreateTopPanelProps) {
  const { t } = useTranslation('common');
  const { selectedFace } = useFaceConfig();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t('wallTickets.titleRequired'));
      return;
    }
    if (!description.trim()) {
      toast.error(t('wallTickets.descriptionRequired'));
      return;
    }
    setSaving(true);
    try {
      await createWallTicket(token, faceId, {
        title: title.trim(),
        description: description.trim(),
      });
      toast.success(t('wallTickets.createSuccess'));
      setTitle('');
      setDescription('');
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : t('wallTickets.createError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wall-ticket-create-top-panel" role="dialog" aria-modal="true">
      <div className="wall-ticket-create-top-panel__inner">
        <div className="wall-ticket-create-top-panel__head">
          <h2>{t('wallTickets.newTicket')}</h2>
          <button type="button" className="wall-ticket-create-top-panel__close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        {selectedFace && <p className="wall-ticket-create-top-panel__face">{selectedFace.title}</p>}
        <form onSubmit={(e) => void handleSubmit(e)} className="wall-ticket-create-top-panel__form">
          <label className="wall-ticket-create-top-panel__field">
            <span>{t('wallTickets.title')}</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              autoComplete="off"
            />
          </label>
          <label className="wall-ticket-create-top-panel__field">
            <span>{t('wallTickets.description')}</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              maxLength={8000}
            />
          </label>
          <div className="wall-ticket-create-top-panel__actions">
            <button
              type="button"
              className="wall-ticket-create-top-panel__btn-secondary"
              onClick={onClose}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="wall-ticket-create-top-panel__btn-primary"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="wall-ticket-create-top-panel__spin" size={20} />
              ) : (
                t('wallTickets.submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
