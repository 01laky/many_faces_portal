/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlbumGridCard } from '@/components/grid/AlbumGrid/AlbumGrid';
import type { AlbumItem } from '@/api/services/AlbumsService';

const album = {
	id: 1,
	title: 'Test Album',
	likesCount: 0,
	commentsCount: 0,
	approvalStatus: 'approved',
} as AlbumItem;

describe('AlbumGridCard memo (PT-RP8)', () => {
	it('PT-RP8-U1: renders album title', () => {
		render(<AlbumGridCard album={album} index={0} gridLayout={null} onOpen={() => undefined} />);
		expect(screen.getByText('Test Album')).toBeTruthy();
	});

	it('PT-RP8-U2: is memo wrapped export', () => {
		expect(typeof AlbumGridCard).toBe('object');
		expect(AlbumGridCard).toHaveProperty('type');
	});
});
