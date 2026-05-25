import DOMPurify from 'dompurify';

/** Tags aligned with BlogQuillEditor toolbar (PSH1-D1 / D7). */
const BLOG_ALLOWED_TAGS = [
	'h1',
	'h2',
	'h3',
	'p',
	'br',
	'strong',
	'b',
	'em',
	'i',
	'u',
	's',
	'strike',
	'ol',
	'ul',
	'li',
	'blockquote',
	'code',
	'pre',
	'a',
];

const BLOG_ALLOWED_ATTR = ['href', 'target', 'rel'];

/** Sanitize operator/user blog HTML before save or render. */
export function sanitizeBlogHtml(html: string | null | undefined): string {
	if (!html) return '';
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: BLOG_ALLOWED_TAGS,
		ALLOWED_ATTR: BLOG_ALLOWED_ATTR,
		ALLOW_DATA_ATTR: false,
	});
}
