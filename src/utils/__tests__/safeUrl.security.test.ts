import { describe, expect, it } from 'vitest';
import { isAllowedHttpsUrl, isSignedUploadServeUrl, sanitizeMediaUrl } from '../safeUrl';

describe('safeUrl (PSH1-T-D02, D03, D04, D09)', () => {
	it('PSH1-T-D04: valid https CDN media allowed', () => {
		expect(isAllowedHttpsUrl('https://cdn.example.com/img.png')).toBe(true);
		expect(sanitizeMediaUrl('https://cdn.example.com/img.png')).toBe(
			'https://cdn.example.com/img.png'
		);
	});

	it('PSH1-T-D02: javascript: rejected', () => {
		expect(sanitizeMediaUrl('javascript:alert(1)')).toBe('');
	});

	it('PSH1-T-D03: data: URI rejected', () => {
		expect(sanitizeMediaUrl('data:text/html,<script>alert(1)</script>')).toBe('');
	});

	it('PSH1-T-D09: signed uploads/serve URL allowed', () => {
		const signed = 'https://api.example.com/acme/api/uploads/serve/abc?sig=deadbeef&exp=9999999999';
		expect(isSignedUploadServeUrl(signed)).toBe(true);
		expect(sanitizeMediaUrl(signed)).toBe(signed);
	});

	it('unsigned serve path rejected', () => {
		expect(sanitizeMediaUrl('https://api.example.com/api/uploads/serve/abc')).toBe('');
	});
});
