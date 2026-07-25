/**
 * @vitest-environment happy-dom
 *
 * PSH1-D3 / FE-P3 — reel media URLs from the Reels API must go through the shared media
 * allow-list before they can reach a `<video src>` attribute. Assertions run against the rendered
 * DOM (not the helper) so a future call site that bypasses `ReelVideo` cannot silently pass.
 */
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReelVideo } from '../ReelVideo';

function renderReelVideo(videoUrl: string | null | undefined): HTMLVideoElement | null {
	const { container } = render(
		createElement(ReelVideo, {
			videoUrl,
			className: 'reel-video',
			muted: true,
			playsInline: true,
			preload: 'metadata',
		})
	);
	return container.querySelector('video');
}

describe('ReelVideo media allow-list (PSH1-T-D10 … D14)', () => {
	it('PSH1-T-D10: https CDN reel video is rendered', () => {
		const video = renderReelVideo('https://cdn.example.com/reels/clip.mp4');
		expect(video?.getAttribute('src')).toBe('https://cdn.example.com/reels/clip.mp4');
		expect(video?.getAttribute('class')).toBe('reel-video');
	});

	it('PSH1-T-D11: javascript: reel URL renders no video element', () => {
		expect(renderReelVideo('javascript:alert(1)')).toBeNull();
	});

	it('PSH1-T-D12: plain http reel URL renders no video element', () => {
		expect(renderReelVideo('http://tracker.example.com/reels/clip.mp4')).toBeNull();
	});

	it('PSH1-T-D13: backend-signed uploads/serve link is rendered', () => {
		const signed = 'https://api.example.com/acme/api/uploads/serve/9?sig=deadbeef&exp=9999999999';
		expect(renderReelVideo(signed)?.getAttribute('src')).toBe(signed);
	});

	it('PSH1-T-D13b: unsigned uploads/serve link renders no video element', () => {
		expect(renderReelVideo('https://api.example.com/acme/api/uploads/serve/9')).toBeNull();
	});

	it('PSH1-T-D14: missing reel URL renders no video element', () => {
		expect(renderReelVideo(null)).toBeNull();
		expect(renderReelVideo(undefined)).toBeNull();
		expect(renderReelVideo('')).toBeNull();
		expect(renderReelVideo('   ')).toBeNull();
	});

	it('PSH1-T-D14b: data: reel URL renders no video element', () => {
		expect(renderReelVideo('data:text/html,<script>alert(1)</script>')).toBeNull();
	});
});
