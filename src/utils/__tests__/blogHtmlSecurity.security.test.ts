/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { sanitizeBlogHtml } from '../blogHtmlSecurity';

describe('blogHtmlSecurity (PSH1-T-D01, D08)', () => {
	it('PSH1-T-D01: strips script tags before render', () => {
		const dirty = '<p>Hello</p><script>alert(1)</script>';
		const clean = sanitizeBlogHtml(dirty);
		expect(clean).not.toContain('<script');
		expect(clean).toContain('Hello');
	});

	it('PSH1-T-D08: BlogForm save payload sanitized', () => {
		const dirty = '<img src=x onerror=alert(1)><strong>ok</strong>';
		const clean = sanitizeBlogHtml(dirty);
		expect(clean).not.toContain('onerror');
		expect(clean).toContain('ok');
	});

	it('allows toolbar-aligned tags', () => {
		const html = '<h2>Title</h2><p><strong>Bold</strong></p>';
		expect(sanitizeBlogHtml(html)).toContain('<strong>');
	});
});
