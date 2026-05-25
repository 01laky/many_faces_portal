import { describe, expect, it } from 'vitest';
import { getContentDetailOwnerFlags, shouldOpenContentDetailEditor } from '../contentDetailPage';

describe('getContentDetailOwnerFlags', () => {
	it('denies edit/delete for non-owners', () => {
		expect(getContentDetailOwnerFlags('u1', 'u2', 'PendingApproval')).toEqual({
			isOwner: false,
			showEditUi: false,
			showDeleteUi: false,
		});
	});

	it('allows owner edit/delete for pending and rejected content', () => {
		expect(getContentDetailOwnerFlags('u1', 'u1', 'PendingApproval')).toEqual({
			isOwner: true,
			showEditUi: true,
			showDeleteUi: true,
		});
		expect(getContentDetailOwnerFlags('u1', 'u1', 'Rejected')).toMatchObject({
			showEditUi: true,
			showDeleteUi: true,
		});
	});

	it('blocks owner edit UI for approved content', () => {
		expect(getContentDetailOwnerFlags('u1', 'u1', 'Approved')).toEqual({
			isOwner: true,
			showEditUi: false,
			showDeleteUi: false,
		});
	});
});

describe('shouldOpenContentDetailEditor', () => {
	it('requires entity, permissions, edit query, and first-time apply', () => {
		expect(
			shouldOpenContentDetailEditor({
				entityLoaded: true,
				showEditUi: true,
				editQueryValue: '1',
				alreadyApplied: false,
			})
		).toBe(true);
		expect(
			shouldOpenContentDetailEditor({
				entityLoaded: false,
				showEditUi: true,
				editQueryValue: '1',
				alreadyApplied: false,
			})
		).toBe(false);
		expect(
			shouldOpenContentDetailEditor({
				entityLoaded: true,
				showEditUi: false,
				editQueryValue: '1',
				alreadyApplied: false,
			})
		).toBe(false);
		expect(
			shouldOpenContentDetailEditor({
				entityLoaded: true,
				showEditUi: true,
				editQueryValue: null,
				alreadyApplied: false,
			})
		).toBe(false);
		expect(
			shouldOpenContentDetailEditor({
				entityLoaded: true,
				showEditUi: true,
				editQueryValue: '1',
				alreadyApplied: true,
			})
		).toBe(false);
	});
});
