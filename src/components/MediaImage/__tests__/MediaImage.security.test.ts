/**
 * @vitest-environment happy-dom
 *
 * PSH1-D3 / FE-P3 — API-supplied image URLs (avatars, story covers) must go through the shared
 * media allow-list before they can reach an `<img src>` attribute. Assertions run against the
 * rendered DOM (not the helper) so a future call site that bypasses `MediaImage` cannot silently
 * pass, and they also check that the call site's own "no image" fallback is what appears instead.
 */
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MediaImage } from '../MediaImage';

const FALLBACK_TEST_ID = 'avatar-fallback';

function renderMediaImage(mediaUrl: string | null | undefined) {
	const { container } = render(
		createElement(MediaImage, {
			mediaUrl,
			alt: '',
			className: 'avatar-img',
			fallback: createElement('span', { 'data-testid': FALLBACK_TEST_ID }, 'no avatar'),
		})
	);
	return {
		img: container.querySelector('img'),
		fallback: container.querySelector(`[data-testid="${FALLBACK_TEST_ID}"]`),
	};
}

describe('MediaImage media allow-list (PSH1-T-D15 … D19)', () => {
	it('PSH1-T-D15: https CDN avatar is rendered', () => {
		const { img, fallback } = renderMediaImage('https://cdn.example.com/avatars/u1.png');
		expect(img?.getAttribute('src')).toBe('https://cdn.example.com/avatars/u1.png');
		expect(img?.getAttribute('class')).toBe('avatar-img');
		expect(fallback).toBeNull();
	});

	it('PSH1-T-D16: javascript: avatar URL renders the fallback and no image', () => {
		const { img, fallback } = renderMediaImage('javascript:alert(1)');
		expect(img).toBeNull();
		expect(fallback).not.toBeNull();
	});

	it('PSH1-T-D17: plain http avatar URL renders the fallback and no image', () => {
		const { img, fallback } = renderMediaImage('http://tracker.example.com/avatars/u1.png');
		expect(img).toBeNull();
		expect(fallback).not.toBeNull();
	});

	it('PSH1-T-D18: backend-signed uploads/serve avatar is rendered', () => {
		const signed =
			'https://api.example.com/acme/api/uploads/serve?path=%2Fuploads%2Fa.png&exp=9999999999&sig=deadbeef';
		const { img, fallback } = renderMediaImage(signed);
		expect(img?.getAttribute('src')).toBe(signed);
		expect(fallback).toBeNull();
	});

	it('PSH1-T-D18b: unsigned uploads/serve avatar renders the fallback and no image', () => {
		const { img, fallback } = renderMediaImage(
			'https://api.example.com/acme/api/uploads/serve?path=%2Fuploads%2Fa.png'
		);
		expect(img).toBeNull();
		expect(fallback).not.toBeNull();
	});

	it('PSH1-T-D19: missing avatar URL renders the fallback and no image', () => {
		for (const value of [null, undefined, '', '   ']) {
			const { img, fallback } = renderMediaImage(value);
			expect(img).toBeNull();
			expect(fallback).not.toBeNull();
		}
	});

	it('PSH1-T-D19b: data: avatar URL renders the fallback and no image', () => {
		const { img, fallback } = renderMediaImage('data:text/html,<script>alert(1)</script>');
		expect(img).toBeNull();
		expect(fallback).not.toBeNull();
	});

	it('PSH1-T-D19c: a rejected URL with no fallback renders nothing at all', () => {
		const { container } = render(
			createElement(MediaImage, { mediaUrl: 'javascript:alert(1)', alt: '' })
		);
		expect(container.innerHTML).toBe('');
	});
});
