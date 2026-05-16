import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Heart, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchWallTicketDetail,
  likeWallTicket,
  unlikeWallTicket,
  addWallTicketComment,
  updateWallTicket,
  deleteWallTicket,
  type WallTicketDetail,
} from '../../api/services/wallTicketsApi';
import './WallTicketDetailPanel.scss';

interface WallTicketDetailPanelProps {
  open: boolean;
  onClose: () => void;
  token: string;
  faceId: number;
  ticketId: number | null;
  onChanged?: () => void;
}

export function WallTicketDetailPanel({
  open,
  onClose,
  token,
  faceId,
  ticketId,
  onChanged,
}: WallTicketDetailPanelProps) {
  const { t } = useTranslation('common');
  const [detail, setDetail] = useState<WallTicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!open || !ticketId) {
        if (!cancelled) setDetail(null);
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const d = await fetchWallTicketDetail(token, faceId, ticketId);
        if (!cancelled) {
          setDetail(d);
          setEditTitle(d.title);
          setEditDescription(d.description);
          setEditing(false);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error && err.message ? err.message : t('wallTickets.loadError')
          );
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, ticketId, token, faceId, t, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !ticketId) return null;

  const refresh = async () => {
    if (!ticketId) return;
    const d = await fetchWallTicketDetail(token, faceId, ticketId);
    setDetail(d);
    setEditTitle(d.title);
    setEditDescription(d.description);
    onChanged?.();
  };

  const handleLike = async () => {
    if (!detail) return;
    try {
      if (detail.isLikedByMe) {
        await unlikeWallTicket(token, faceId, detail.id);
      } else {
        await likeWallTicket(token, faceId, detail.id);
      }
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : t('wallTickets.likeError'));
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !commentText.trim()) return;
    try {
      await addWallTicketComment(token, faceId, detail.id, commentText.trim());
      setCommentText('');
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error && err.message ? err.message : t('wallTickets.commentError')
      );
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setSaving(true);
    try {
      await updateWallTicket(token, faceId, detail.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      toast.success(t('wallTickets.saveSuccess'));
      setEditing(false);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : t('wallTickets.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (!window.confirm(t('wallTickets.confirmDelete'))) return;
    try {
      await deleteWallTicket(token, faceId, detail.id);
      toast.success(t('wallTickets.deleted'));
      onChanged?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : t('wallTickets.deleteError'));
    }
  };

  const statusLabel = (s: string) => t(`wallTickets.status.${s}`, s);

  return (
    <div className={`wall-ticket-detail-panel ${open ? 'wall-ticket-detail-panel--open' : ''}`}>
      <div className="wall-ticket-detail-panel__backdrop" onClick={onClose} aria-hidden />
      <aside className="wall-ticket-detail-panel__sheet" role="dialog" aria-modal="true">
        <div className="wall-ticket-detail-panel__head">
          <h2>{t('wallTickets.detailTitle')}</h2>
          <button
            type="button"
            className="wall-ticket-detail-panel__close"
            onClick={onClose}
            aria-label={t('wallTickets.close')}
          >
            <X size={22} />
          </button>
        </div>
        <div className="wall-ticket-detail-panel__body">
          {loading && (
            <div className="wall-ticket-detail-panel__loading">
              <Loader2 className="wall-ticket-detail-panel__spin" size={28} />
            </div>
          )}
          {!loading && detail && (
            <>
              <div className="wall-ticket-detail-panel__meta">
                <span
                  className={`wall-ticket-detail-panel__badge wall-ticket-detail-panel__badge--${detail.status}`}
                >
                  {statusLabel(detail.status)}
                </span>
                <span className="wall-ticket-detail-panel__author">
                  {detail.creatorName || detail.creatorId}
                </span>
              </div>

              {editing && detail.status === 'active' && detail.isAuthor ? (
                <form
                  onSubmit={(e) => void handleSaveEdit(e)}
                  className="wall-ticket-detail-panel__edit-form"
                >
                  <label>
                    {t('wallTickets.title')}
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={200}
                    />
                  </label>
                  <label>
                    {t('wallTickets.description')}
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={5}
                      maxLength={8000}
                    />
                  </label>
                  <div className="wall-ticket-detail-panel__edit-actions">
                    <button type="button" onClick={() => setEditing(false)}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" disabled={saving}>
                      {saving ? (
                        <Loader2 className="wall-ticket-detail-panel__spin" size={18} />
                      ) : (
                        t('common.save')
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 className="wall-ticket-detail-panel__title">{detail.title}</h3>
                  <p className="wall-ticket-detail-panel__description">{detail.description}</p>
                </>
              )}

              <div className="wall-ticket-detail-panel__actions-row">
                {detail.canInteract && (
                  <button
                    type="button"
                    className={`wall-ticket-detail-panel__like ${detail.isLikedByMe ? 'wall-ticket-detail-panel__like--on' : ''}`}
                    onClick={() => void handleLike()}
                  >
                    <Heart size={20} fill={detail.isLikedByMe ? 'currentColor' : 'none'} />
                    <span>{detail.likesCount}</span>
                  </button>
                )}
                {!detail.canInteract && (
                  <div className="wall-ticket-detail-panel__like-readonly">
                    <Heart size={20} />
                    <span>{detail.likesCount}</span>
                    {detail.interactionsFrozen && (
                      <span className="wall-ticket-detail-panel__frozen">
                        {t('wallTickets.frozenHint')}
                      </span>
                    )}
                  </div>
                )}
                {detail.status === 'active' && detail.isAuthor && !editing && (
                  <button
                    type="button"
                    className="wall-ticket-detail-panel__text-btn"
                    onClick={() => setEditing(true)}
                  >
                    {t('common.edit')}
                  </button>
                )}
                {detail.status === 'active' && detail.isAuthor && (
                  <button
                    type="button"
                    className="wall-ticket-detail-panel__text-btn-danger"
                    onClick={() => void handleDelete()}
                  >
                    <Trash2 size={18} />
                    {t('common.delete')}
                  </button>
                )}
              </div>

              {detail.canInteract && (
                <form
                  onSubmit={(e) => void handleComment(e)}
                  className="wall-ticket-detail-panel__comment-form"
                >
                  <label>
                    {t('wallTickets.newComment')}
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={255}
                      placeholder={t('wallTickets.commentPlaceholder')}
                    />
                  </label>
                  <button type="submit">{t('wallTickets.postComment')}</button>
                </form>
              )}

              <ul className="wall-ticket-detail-panel__comments">
                {detail.comments.map((c) => (
                  <li key={c.id}>
                    <strong>{c.authorName || c.userId}</strong>
                    <span className="wall-ticket-detail-panel__comment-date">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                    <p>{c.content}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
