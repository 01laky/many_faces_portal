/**
 * Blog - Latest blog post for the current face (API-backed)
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { getBlogs, type BlogItem } from '../../../api/services/BlogsService';
import { blogCoverPlaceholderUrl } from '../gridDisplayHelpers';
import './Blog.scss';

function blogCover(blog: BlogItem): string {
  const first = blog.images?.[0]?.imageUrl;
  if (first) return first;
  return blogCoverPlaceholderUrl();
}

function excerpt(text: string, max = 120): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function Blog() {
  const { t } = useTranslation('common');
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const getLocalizedPath = useLocalizedLink();
  const faceId = selectedFace?.id;

  const [post, setPost] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!token || faceId == null) {
        if (!cancelled) {
          setLoading(false);
          setPost(null);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const list = await getBlogs(token, faceId);
        if (!cancelled) setPost(list[0] ?? null);
      } catch {
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, faceId]);

  if (!token || faceId == null) {
    return (
      <div className="blog-component blog-component--message">
        <p>{t(k.guest.blogs)}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="blog-component blog-component--message">
        <Loader2 size={28} aria-label={t(k.loadingAria)} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-component blog-component--message">
        <p>{t(k.empty.blogsFace)}</p>
      </div>
    );
  }

  const dateStr = new Date(post.createdAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link className="blog-component blog-component--link" to={getLocalizedPath(`/blog/${post.id}`)}>
      <img className="blog-photo" src={blogCover(post)} alt={post.title} loading="lazy" />
      <div className="blog-overlay">
        <span className="blog-date">{dateStr}</span>
        <span className="blog-title">{post.title}</span>
        <span className="blog-excerpt">{excerpt(post.content)}</span>
      </div>
    </Link>
  );
}
