import { describe, expect, it } from 'vitest';
import {
  getCreatorSafeReason,
  getCreatorStatusLabel,
  getSubmissionGroupKey,
  getSubmittedForApprovalCopy,
  groupSubmissionsByStatus,
  shouldShowCreatorStatusBadge,
  isCreatorModerationEditAllowed,
  canOwnerUseModerationEditorActions,
  buildMySubmissionDetailRelativePath,
} from '../contentModeration';

describe('content moderation helpers', () => {
  it.each([
    ['PendingApproval', 'Queued', 'Pending approval'],
    ['PendingApproval', 'InProgress', 'Under AI review'],
    ['PendingApproval', 'NeedsHumanReview', 'Needs review'],
    ['Approved', 'RecommendedApprove', 'Approved'],
    ['Rejected', 'RecommendedReject', 'Rejected'],
    ['Removed', 'Failed', 'Removed'],
  ])('maps %s/%s to %s', (approvalStatus, aiReviewStatus, expected) => {
    expect(getCreatorStatusLabel(approvalStatus, aiReviewStatus)).toBe(expected);
  });

  it('uses safe pending copy for unknown statuses', () => {
    expect(getCreatorStatusLabel('InternalOnly', 'TraceLeaking')).toBe('Pending approval');
  });

  it.each([
    ['album', 'Album submitted for approval. Your content was created and is waiting for review.'],
    ['blog', 'Blog submitted for approval. Your content was created and is waiting for review.'],
    ['reel', 'Reel submitted for approval. Your content was created and is waiting for review.'],
  ] as const)('builds submitted copy for %s', (contentType, expected) => {
    expect(getSubmittedForApprovalCopy(contentType)).toBe(expected);
  });

  it('shows creator badges only for non-approved moderated content', () => {
    expect(shouldShowCreatorStatusBadge('PendingApproval')).toBe(true);
    expect(shouldShowCreatorStatusBadge('Rejected')).toBe(true);
    expect(shouldShowCreatorStatusBadge('Removed')).toBe(true);
    expect(shouldShowCreatorStatusBadge('Approved')).toBe(false);
    expect(shouldShowCreatorStatusBadge(undefined)).toBe(false);
  });

  it('builds safe short creator reasons without internal detail fallback', () => {
    expect(getCreatorSafeReason(' Please update this post. ', 'Internal moderation note')).toBe(
      'Please update this post.'
    );
    expect(getCreatorSafeReason(null, 'Human reason')).toBe('Human reason');
    expect(getCreatorSafeReason(null, null)).toBeNull();
    expect(getCreatorSafeReason('x'.repeat(300))).toHaveLength(243);
  });

  it.each([
    ['PendingApproval', 'Queued', 'underAiReview'],
    ['PendingApproval', 'InProgress', 'underAiReview'],
    ['PendingApproval', 'NeedsHumanReview', 'needsReview'],
    ['PendingApproval', 'Failed', 'needsReview'],
    ['PendingApproval', 'RecommendedApprove', 'pendingApproval'],
    ['Approved', 'RecommendedApprove', 'approved'],
    ['Rejected', 'RecommendedReject', 'rejected'],
    ['Removed', 'Failed', 'removed'],
  ] as const)('groups %s/%s into %s', (approvalStatus, aiReviewStatus, expected) => {
    expect(getSubmissionGroupKey(approvalStatus, aiReviewStatus)).toBe(expected);
  });

  it('groups my submissions by creator-facing status', () => {
    const grouped = groupSubmissionsByStatus([
      {
        contentType: 'Blog',
        contentId: 1,
        title: 'Queued',
        faceId: 1,
        faceTitle: 'Face',
        approvalStatus: 'PendingApproval',
        aiReviewStatus: 'Queued',
        creatorStatusLabel: 'Under AI review',
        createdAt: '2026-05-12T00:00:00Z',
        canEdit: true,
        canDelete: true,
      },
      {
        contentType: 'Reel',
        contentId: 2,
        title: 'Rejected',
        faceId: 1,
        faceTitle: 'Face',
        approvalStatus: 'Rejected',
        aiReviewStatus: 'RecommendedReject',
        creatorStatusLabel: 'Rejected',
        createdAt: '2026-05-12T00:00:00Z',
        canEdit: true,
        canDelete: true,
      },
    ]);

    expect(grouped.underAiReview).toHaveLength(1);
    expect(grouped.rejected).toHaveLength(1);
    expect(grouped.approved).toHaveLength(0);
  });

  it('allows creator edit/delete only for pending or rejected approval', () => {
    expect(isCreatorModerationEditAllowed('PendingApproval')).toBe(true);
    expect(isCreatorModerationEditAllowed('Rejected')).toBe(true);
    expect(isCreatorModerationEditAllowed('Approved')).toBe(false);
    expect(isCreatorModerationEditAllowed('Removed')).toBe(false);
  });

  it('gates owner editor actions by moderation state', () => {
    expect(canOwnerUseModerationEditorActions(true, 'Rejected')).toBe(true);
    expect(canOwnerUseModerationEditorActions(false, 'Rejected')).toBe(false);
    expect(canOwnerUseModerationEditorActions(true, 'Approved')).toBe(false);
  });

  it('builds relative detail paths for my submissions links', () => {
    expect(buildMySubmissionDetailRelativePath('Blog', 9)).toBe('../blog/9');
    expect(buildMySubmissionDetailRelativePath('Album', 3, { openEditor: true })).toBe(
      '../album/3?edit=1'
    );
    expect(buildMySubmissionDetailRelativePath('Reel', 100)).toBe('../reel/100');
  });
});
