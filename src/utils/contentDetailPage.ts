import {
	canOwnerUseModerationEditorActions,
	isCreatorModerationDeleteAllowed,
	type ContentApprovalStatus,
} from './contentModeration';

/** Creator-only edit/delete affordances on album, blog, and reel detail pages. */
export function getContentDetailOwnerFlags(
	userId: string | undefined,
	creatorId: string | undefined,
	approvalStatus?: ContentApprovalStatus | string | null
) {
	const isOwner = Boolean(userId && creatorId && userId === creatorId);
	return {
		isOwner,
		showEditUi: canOwnerUseModerationEditorActions(isOwner, approvalStatus),
		showDeleteUi: isOwner && isCreatorModerationDeleteAllowed(approvalStatus),
	};
}

/**
 * Whether `?edit=1` should open the moderation editor once.
 * Requires a loaded entity, permitted owner edits, the query flag, and no prior auto-open this navigation.
 */
export function shouldOpenContentDetailEditor(params: {
	entityLoaded: boolean;
	showEditUi: boolean;
	editQueryValue: string | null;
	alreadyApplied: boolean;
}): boolean {
	return (
		params.entityLoaded &&
		params.showEditUi &&
		params.editQueryValue === '1' &&
		!params.alreadyApplied
	);
}
