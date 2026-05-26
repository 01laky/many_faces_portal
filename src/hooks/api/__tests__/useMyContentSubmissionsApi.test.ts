import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchMyContentSubmissions } from '@/hooks/api/useMyContentSubmissionsApi';

const mockRequest = vi.fn();

vi.mock('../../../api/core/request', () => ({
	request: (...args: unknown[]) => mockRequest(...args),
}));

vi.mock('../../../api/core/OpenAPI', () => ({
	OpenAPI: {
		BASE: 'http://localhost:8000',
		TOKEN: null,
	},
}));

describe('fetchMyContentSubmissions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls GET /api/my/content-submissions', async () => {
		mockRequest.mockResolvedValue([]);

		await fetchMyContentSubmissions();

		expect(mockRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				method: 'GET',
				url: '/api/my/content-submissions',
			})
		);
	});

	it('returns typed array payload from API', async () => {
		mockRequest.mockResolvedValue([
			{
				contentType: 'Blog',
				contentId: 7,
				title: 'Hello',
				faceId: 1,
				faceTitle: 'Public',
				approvalStatus: 'PendingApproval',
				aiReviewStatus: 'Queued',
				creatorStatusLabel: 'Pending approval',
				createdAt: '2026-05-12T00:00:00Z',
				canEdit: true,
				canDelete: true,
			},
		]);

		const rows = await fetchMyContentSubmissions();
		expect(rows).toHaveLength(1);
		expect(rows[0].contentType).toBe('Blog');
		expect(rows[0].canEdit).toBe(true);
	});
});
