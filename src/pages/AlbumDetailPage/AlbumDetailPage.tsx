import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, MessageSquare, Loader2, Pencil, Trash2, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import {
  getAlbum,
  likeAlbum,
  unlikeAlbum,
  getAlbumComments,
  createAlbumComment,
  deleteAlbumComment,
  deleteAlbum,
  type AlbumItem,
  type AlbumComment,
} from '../../api/services/AlbumsService';
import { AlbumForm } from '../../components/grid/AlbumForm';
import {
  canOwnerUseModerationEditorActions,
  isCreatorModerationDeleteAllowed,
} from '../../utils/contentModeration';
import './AlbumDetailPage.scss';

const ALBUM_TYPE_LABELS: Record<number, string> = { 1: 'Public', 2: 'Private', 3: 'Paid' };
const MEDIA_TYPE_LABELS: Record<number, string> = { 1: 'Image', 2: 'Video' };

/**
 * Album detail with likes/comments. Edit/delete are limited to the owning creator while moderation still allows it;
 * `?edit=1` opens the edit form once when permitted (same pattern as blogs/reels).
 */
export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const autoEditApplied = useRef(false);
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();

  const [album, setAlbum] = useState<AlbumItem | null>(null);
  const [comments, setComments] = useState<AlbumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadAlbum = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await getAlbum(Number(id), token);
      setAlbum(data);
      setError(false);
    } catch {
      setError(true);
      setAlbum(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  const loadComments = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await getAlbumComments(Number(id), token);
      setComments(data);
    } catch {
      // silently fail
    }
  }, [id, token]);

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await loadAlbum();
      await loadComments();
    })();
  }, [loadAlbum, loadComments]);

  // Ownership + moderation policy: mirrors backend creator edit/delete rules for header UX only.
  const isOwner = Boolean(user?.id && album?.creatorId && user.id === album.creatorId);
  const showEditUi = canOwnerUseModerationEditorActions(isOwner, album?.approvalStatus);
  const showDeleteUi = isOwner && isCreatorModerationDeleteAllowed(album?.approvalStatus);

  useEffect(() => {
    // Reset deep-link auto edit when navigating between album ids in-session.
    autoEditApplied.current = false;
  }, [id]);

  useEffect(() => {
    // Honor `?edit=1` from "My submissions" once the entity is loaded and edits are permitted.
    if (!album || !showEditUi || autoEditApplied.current) return;
    if (searchParams.get('edit') !== '1') return;
    autoEditApplied.current = true;
    const schedule = window.setTimeout(() => setEditing(true), 0);
    return () => window.clearTimeout(schedule);
  }, [album, searchParams, showEditUi]);

  const handleLike = async () => {
    if (!album || !token) return;
    setLikeLoading(true);
    try {
      if (album.isLikedByMe) {
        await unlikeAlbum(album.id, token);
      } else {
        await likeAlbum(album.id, token);
      }
      await loadAlbum();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album || !token || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      await createAlbumComment(album.id, commentText.trim(), token);
      setCommentText('');
      await loadComments();
      await loadAlbum();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!album || !token) return;
    try {
      await deleteAlbumComment(album.id, commentId, token);
      await loadComments();
      await loadAlbum();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!album || !token) return;
    setDeleting(true);
    try {
      await deleteAlbum(album.id, token);
      toast.success('Album deleted');
      navigate(getLocalizedPath('/list/2'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleAlbumSaved = (saved: AlbumItem) => {
    setAlbum(saved);
    setEditing(false);
    toast.success('Album updated');
    loadAlbum();
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

  if (error || !album) {
    return (
      <div className="album-detail-page">
        <button className="album-detail-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>{t('back')}</span>
        </button>
        <div className="album-detail-error">{t('albumDetail.notFound', 'Album not found')}</div>
      </div>
    );
  }

  return (
    <div className="album-detail-page">
      <div className="album-detail-header">
        <button className="album-detail-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>{t('back')}</span>
        </button>
        <div className="album-detail-header-actions">
          {showEditUi && (
            <button
              className="album-detail-action-btn"
              onClick={() => setEditing(!editing)}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          )}
          {showDeleteUi && (
            <button
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

      {editing && showEditUi && (
        <div className="album-detail-edit-panel">
          <AlbumForm
            editAlbum={album}
            onSaved={handleAlbumSaved}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      <div className="album-detail-info">
        <h1 className="album-detail-title">{album.title}</h1>
        {album.description && <p className="album-detail-description">{album.description}</p>}
        <div className="album-detail-meta">
          <span className="album-detail-badge">
            {ALBUM_TYPE_LABELS[album.albumType] ?? 'Unknown'}
          </span>
          <span className="album-detail-badge">
            {MEDIA_TYPE_LABELS[album.mediaType] ?? 'Unknown'}
          </span>
          <span className="album-detail-creator">by {album.creatorName}</span>
        </div>
        {album.faces.length > 0 && (
          <div className="album-detail-faces">
            {album.faces.map((f) => (
              <span key={f.faceId} className="album-detail-face-tag">
                {f.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Like + stats bar */}
      <div className="album-detail-stats">
        <button
          className={`album-detail-like-btn ${album.isLikedByMe ? 'album-detail-like-btn--liked' : ''}`}
          onClick={handleLike}
          disabled={likeLoading}
        >
          <Heart size={18} fill={album.isLikedByMe ? 'currentColor' : 'none'} />
          <span>{album.likesCount}</span>
        </button>
        <span className="album-detail-stat">
          <MessageSquare size={16} />
          <span>{album.commentsCount}</span>
        </span>
      </div>

      {/* Comments section */}
      <div className="album-detail-comments">
        <h2 className="album-detail-comments-title">
          {t('albumDetail.comments', 'Comments')} ({comments.length})
        </h2>

        <form className="album-detail-comment-form" onSubmit={handleCommentSubmit}>
          <input
            type="text"
            className="album-detail-comment-input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('albumDetail.writeComment', 'Write a comment...')}
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
                <span className="album-detail-comment-date">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <button
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
              {t('albumDetail.noComments', 'No comments yet')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
