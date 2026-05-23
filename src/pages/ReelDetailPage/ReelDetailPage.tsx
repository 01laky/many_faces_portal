import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MessageSquare, Loader2, Pencil, Trash2, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import {
  getReel,
  likeReel,
  unlikeReel,
  getReelComments,
  createReelComment,
  deleteReelComment,
  deleteReel,
  type ReelItem,
  type ReelComment,
} from '../../api/services/ReelsService';
import { ReelForm } from '../../components/grid/ReelForm';
import { useContentDetailAutoEdit } from '../../hooks/useContentDetailAutoEdit';
import { getContentDetailOwnerFlags } from '../../utils/contentDetailPage';
import { formatContentDate } from '../../utils/contentDetailFormat';
import '../AlbumDetailPage/AlbumDetailPage.scss';
import './ReelDetailPage.scss';
import '../../styles/contentDetailPage.scss';

/**
 * Reel detail page (reuses album layout styles). API calls are face-scoped via `FaceConfigContext` so multi-face reels resolve correctly.
 * Edit/delete gating matches blogs/albums: owner + pending/rejected only, with optional `?edit=1` deep link support.
 */
export function ReelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const { selectedFace } = useFaceConfig();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();

  /** Current face from shell navigation; forwarded to reel APIs for visibility checks. */
  const faceId = selectedFace?.id;

  const [reel, setReel] = useState<ReelItem | null>(null);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadReel = useCallback(async () => {
    if (!id || !token) return;
    setLoading(true);
    try {
      const data = await getReel(Number(id), token, faceId);
      setReel(data);
      setError(false);
    } catch {
      setError(true);
      setReel(null);
    } finally {
      setLoading(false);
    }
  }, [id, token, faceId]);

  const loadComments = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await getReelComments(Number(id), token, faceId);
      setComments(data);
    } catch {
      // ignore
    }
  }, [id, token, faceId]);

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await loadReel();
      await loadComments();
    })();
  }, [loadReel, loadComments]);

  const { showEditUi, showDeleteUi } = getContentDetailOwnerFlags(
    user?.id,
    reel?.creatorId,
    reel?.approvalStatus
  );
  const { editing, setEditing } = useContentDetailAutoEdit({
    routeId: id,
    entityLoaded: Boolean(reel),
    showEditUi,
  });

  const handleLike = async () => {
    if (!reel || !token) return;
    setLikeLoading(true);
    try {
      if (reel.isLikedByMe) {
        await unlikeReel(reel.id, token, faceId);
      } else {
        await likeReel(reel.id, token, faceId);
      }
      await loadReel();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reel || !token || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      await createReelComment(reel.id, commentText.trim(), token, faceId);
      setCommentText('');
      await loadComments();
      await loadReel();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!reel || !token) return;
    try {
      await deleteReelComment(reel.id, commentId, token);
      await loadComments();
      await loadReel();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!reel || !token) return;
    setDeleting(true);
    try {
      await deleteReel(reel.id, token);
      toast.success('Reel deleted');
      navigate(getLocalizedPath('/list/7'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleReelSaved = (saved: ReelItem) => {
    setReel(saved);
    setEditing(false);
    toast.success('Reel updated');
    loadReel();
  };

  if (loading) {
    return (
      <div className="album-detail-page">
        <div className="album-detail-loading">
          <Loader2 size={32} className="album-detail-spinner" />
        </div>
      </div>
    );
  }

  if (error || !reel) {
    return (
      <div className="album-detail-page">
        <div className="album-detail-error">{t('reelDetail.notFound', 'Reel not found')}</div>
      </div>
    );
  }

  return (
    <div className="album-detail-page reel-detail-page">
      {(showEditUi || showDeleteUi) && (
        <div className="album-detail-header">
          <div className="album-detail-header-actions">
            {showEditUi && (
              <button
                type="button"
                className="album-detail-action-btn"
                onClick={() => setEditing(!editing)}
                title="Edit"
              >
                <Pencil size={16} />
              </button>
            )}
            {showDeleteUi && (
              <button
                type="button"
                className="album-detail-action-btn album-detail-action-btn--danger"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete"
              >
                {deleting ? (
                  <Loader2 size={16} className="album-detail-spinner" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {editing && showEditUi && (
        <div className="album-detail-edit-panel">
          <ReelForm editReel={reel} onSaved={handleReelSaved} onCancel={() => setEditing(false)} />
        </div>
      )}

      <div className="reel-detail-video-wrap">
        <video className="reel-detail-video" controls playsInline src={reel.videoUrl} />
      </div>

      <div className="album-detail-info">
        <h1 className="album-detail-title">{reel.title}</h1>
        {reel.description && <p className="album-detail-description">{reel.description}</p>}
        <div className="album-detail-meta">
          <span className="album-detail-creator">by {reel.creatorName}</span>
        </div>
        {reel.faces.length > 0 && (
          <div className="album-detail-faces">
            {reel.faces.map((f) => (
              <span key={f.faceId} className="album-detail-face-tag">
                {f.title}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="album-detail-stats">
        <button
          type="button"
          className={`album-detail-like-btn ${reel.isLikedByMe ? 'album-detail-like-btn--liked' : ''}`}
          onClick={handleLike}
          disabled={likeLoading}
        >
          <Heart size={18} fill={reel.isLikedByMe ? 'currentColor' : 'none'} />
          <span>{reel.likesCount}</span>
        </button>
        <span className="album-detail-stat">
          <MessageSquare size={16} />
          <span>{reel.commentsCount}</span>
        </span>
      </div>

      <div className="album-detail-comments">
        <h2 className="album-detail-comments-title">
          {t('reelDetail.comments', 'Comments')} ({comments.length})
        </h2>

        <form className="album-detail-comment-form" onSubmit={handleCommentSubmit}>
          <input
            type="text"
            className="album-detail-comment-input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('reelDetail.writeComment', 'Write a comment...')}
            maxLength={2000}
          />
          <button
            type="submit"
            className="album-detail-comment-submit"
            disabled={commentLoading || !commentText.trim()}
          >
            {commentLoading ? (
              <Loader2 size={16} className="album-detail-spinner" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>

        <div className="album-detail-comments-list">
          {comments.map((c) => (
            <div key={c.id} className="album-detail-comment">
              <div className="album-detail-comment-header">
                <span className="album-detail-comment-author">{c.userName}</span>
                <span className="album-detail-comment-date">{formatContentDate(c.createdAt)}</span>
                <button
                  type="button"
                  className="album-detail-comment-delete"
                  onClick={() => handleDeleteComment(c.id)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="album-detail-comment-text">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="album-detail-no-comments">
              {t('reelDetail.noComments', 'No comments yet')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
