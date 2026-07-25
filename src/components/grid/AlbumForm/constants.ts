import { gridBlockI18nKeys as k } from '../gridBlockI18n';

/**
 * Select options carry the i18n key plus the English default so option copy goes through
 * `t(key, defaultLabel)` at render time instead of shipping a hardcoded label.
 */
export const ALBUM_TYPES = [
	{ value: 1, labelKey: k.albumForm.typePublic, defaultLabel: 'Public' },
	{ value: 2, labelKey: k.albumForm.typePrivate, defaultLabel: 'Private' },
	{ value: 3, labelKey: k.albumForm.typePaid, defaultLabel: 'Paid' },
];

export const MEDIA_TYPES = [
	{ value: 1, labelKey: k.albumForm.mediaImage, defaultLabel: 'Image' },
	{ value: 2, labelKey: k.albumForm.mediaVideo, defaultLabel: 'Video' },
];
