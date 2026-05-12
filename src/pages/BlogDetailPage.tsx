import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, MessageSquare, Loader2, Pencil, Trash2, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import {
  getBlog,
  likeBlog,
  unlikeBlog,
  getBlogComments,
  createBlogComment,
  deleteBlogComment,
  deleteBlog,
  type BlogItem,
  type BlogComment,
} from '../api/services/BlogsService';
import { BlogForm } from '../components/grid/BlogForm';
import {
  canOwnerUseModerationEditorActions,
  isCreatorModerationDeleteAllowed,
} from '../utils/contentModeration';
import './BlogDetailPage.scss';

/**
 * Public blog detail with social features. Edit/delete header actions are shown only when the viewer owns the blog
 * and the server still allows creator edits (pending or rejected). `?edit=1` auto-opens the editor once per navigation.
 */
export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const autoEditApplied = useRef(false);
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadBlog = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await getBlog(Number(id), token);
      setBlog(data);
      setError(false);
    } catch {
      setError(true);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  const loadComments = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await getBlogComments(Number(id), token);
      setComments(data);
    } catch {
      // silently fail
    }
  }, [id, token]);

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await loadBlog();
      await loadComments();
    })();
  }, [loadBlog, loadComments]);

  // Ownership + moderation policy: mirrors backend creator edit/delete rules for header UX only.
  const isOwner = Boolean(user?.id && blog?.creatorId && user.id === blog.creatorId);
  const showEditUi = isOwner && canOwnerUseModerationEditorActions(blog?.approvalStatus);
  const showDeleteUi = isOwner && isCreatorModerationDeleteAllowed(blog?.approvalStatus);

  useEffect(() => {
    // Reset deep-link auto edit when navigating between blog ids in-session.
    autoEditApplied.current = false;
  }, [id]);

  useEffect(() => {
    // Honor `?edit=1` from "My submissions" once the entity is loaded and edits are permitted.
    if (!blog || !showEditUi || autoEditApplied.current) return;
    if (searchParams.get('edit') !== '1') return;
    autoEditApplied.current = true;
    const schedule = window.setTimeout(() => setEditing(true), 0);
    return () => window.clearTimeout(schedule);
  }, [blog, searchParams, showEditUi]);

  const handleLike = async () => {
    if (!blog || !token) return;
    setLikeLoading(true);
    try {
      if (blog.isLikedByMe) {
        await unlikeBlog(blog.id, token);
      } else {
        await likeBlog(blog.id, token);
      }
      await loadBlog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blog || !token || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      await createBlogComment(blog.id, commentText.trim(), token);
      setCommentText('');
      await loadComments();
      await loadBlog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!blog || !token) return;
    try {
      await deleteBlogComment(blog.id, commentId, token);
      await loadComments();
      await loadBlog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!blog || !token) return;
    setDeleting(true);
    try {
      await deleteBlog(blog.id, token);
      toast.success('Blog deleted');
      navigate(getLocalizedPath('/list/3'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleBlogSaved = (saved: BlogItem) => {
    setBlog(saved);
    setEditing(false);
    toast.success('Blog updated');
    loadBlog();
  };

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-loading">
          <Loader2 size={32} className="blog-detail-spinner" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-detail-page">
        <button className="blog-detail-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>{t('back')}</span>
        </button>
        <div className="blog-detail-error">{t('blogDetail.notFound', 'Blog not found')}</div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-header">
        <button className="blog-detail-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>{t('back')}</span>
        </button>
        <div className="blog-detail-header-actions">
          {showEditUi && (
            <button
              className="blog-detail-action-btn"
              onClick={() => setEditing(!editing)}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          )}
          {showDeleteUi && (
            <button
              className="blog-detail-action-btn blog-detail-action-btn--danger"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete"
            >
              {deleting ? (
                <Loader2 size={16} className="blog-detail-spinner" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          )}
        </div>
      </div>

      {editing && showEditUi && (
        <div className="blog-detail-edit-panel">
          <BlogForm editBlog={blog} onSaved={handleBlogSaved} onCancel={() => setEditing(false)} />
        </div>
      )}

      <div className="blog-detail-info">
        <h1 className="blog-detail-title">{blog.title}</h1>
        <div className="blog-detail-meta">
          <span className="blog-detail-badge">{blog.faceTitle}</span>
          <span className="blog-detail-creator">by {blog.creatorName}</span>
          <span className="blog-detail-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Blog images */}
      {blog.images.length > 0 && (
        <div className="blog-detail-images">
          {blog.images.map((img) => (
            <img
              key={img.id}
              src={img.imageUrl}
              alt=""
              className="blog-detail-image"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Blog content (HTML) */}
      <div className="blog-detail-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

      {/* Like + stats bar */}
      <div className="blog-detail-stats">
        <button
          className={`blog-detail-like-btn ${blog.isLikedByMe ? 'blog-detail-like-btn--liked' : ''}`}
          onClick={handleLike}
          disabled={likeLoading}
        >
          <Heart size={18} fill={blog.isLikedByMe ? 'currentColor' : 'none'} />
          <span>{blog.likesCount}</span>
        </button>
        <span className="blog-detail-stat">
          <MessageSquare size={16} />
          <span>{blog.commentsCount}</span>
        </span>
      </div>

      {/* Comments section */}
      <div className="blog-detail-comments">
        <h2 className="blog-detail-comments-title">
          {t('blogDetail.comments', 'Comments')} ({comments.length})
        </h2>

        <form className="blog-detail-comment-form" onSubmit={handleCommentSubmit}>
          <input
            type="text"
            className="blog-detail-comment-input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('blogDetail.writeComment', 'Write a comment...')}
            maxLength={2000}
          />
          <button
            type="submit"
            className="blog-detail-comment-submit"
            disabled={commentLoading || !commentText.trim()}
          >
            {commentLoading ? (
              <Loader2 size={16} className="blog-detail-spinner" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>

        <div className="blog-detail-comments-list">
          {comments.map((c) => (
            <div key={c.id} className="blog-detail-comment">
              <div className="blog-detail-comment-header">
                <span className="blog-detail-comment-author">{c.userName}</span>
                <span className="blog-detail-comment-date">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <button
                  className="blog-detail-comment-delete"
                  onClick={() => handleDeleteComment(c.id)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="blog-detail-comment-text">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="blog-detail-no-comments">
              {t('blogDetail.noComments', 'No comments yet')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
