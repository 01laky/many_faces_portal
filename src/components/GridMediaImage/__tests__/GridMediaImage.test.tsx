/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GridMediaImage } from '@/components/GridMediaImage/GridMediaImage';

describe('GridMediaImage (PT-RP26)', () => {
	it('PT-RP26-U1: default lazy + async decode', () => {
		const { container } = render(<GridMediaImage src="/img.jpg" alt="cover" />);
		const img = container.querySelector('img');
		expect(img?.getAttribute('loading')).toBe('lazy');
		expect(img?.getAttribute('decoding')).toBe('async');
	});

	it('PT-RP26-U1b: priority uses eager + fetchPriority', () => {
		const { container } = render(<GridMediaImage src="/img.jpg" alt="hero" priority />);
		const img = container.querySelector('img');
		expect(img?.getAttribute('loading')).toBe('eager');
		expect(img?.getAttribute('fetchpriority')).toBe('high');
	});

	it('PT-RP26-U2: passes through alt and src', () => {
		const { getByAltText } = render(<GridMediaImage src="/x.png" alt="Album cover" />);
		expect(getByAltText('Album cover')).toBeTruthy();
	});

	it('explicit loading prop overrides default', () => {
		const { container } = render(<GridMediaImage src="/img.jpg" alt="x" loading="eager" />);
		expect(container.querySelector('img')?.getAttribute('loading')).toBe('eager');
	});
});
