/**
 * Blog - Latest blog post for the current face (API-backed)
 */

import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { useBlogsGridQuery } from '../../../hooks/api/gridQueries';
import type { BlogItem } from '../../../api/services/BlogsService';
import { blogCoverPlaceholderUrl } from '../gridDisplayHelpers';
import { sanitizeMediaUrl } from '../../../utils/safeUrl';
import './Blog.scss';

/**
 * PSH1-D3 / FE-P3 — the first blog image is an API value bound to `<img src>`, so it goes through
 * the shared media allow-list; a rejected cover degrades to the neutral placeholder already used
 * for posts without images (same rule as `BlogDetailPage`).
 */
function blogCover(blog: BlogItem): string {
	const first = sanitizeMediaUrl(blog.images?.[0]?.imageUrl);
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

	// Same TanStack Query hook as BlogGrid/BlogCarousel: shared per-face cache (PT-RP2)
	// and IO-gated fetch (PT-RP16). Errors leave `data` undefined → empty state, matching
	// the previous useEffect version which nulled the post on failure.
	const fetchEnabled = useGridBlockFetchEnabled();
	const { data: blogs = [], isLoading: loading } = useBlogsGridQuery(token, faceId, fetchEnabled);
	const post = blogs[0] ?? null;

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
