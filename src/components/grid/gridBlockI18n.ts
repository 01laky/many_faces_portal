/**
 * i18n keys for grid block UI copy (`PortalResources` → `gridBlocks.*` in `common` namespace).
 * Use with `useTranslation('common')` and `t(key)`.
 *
 * Keys under `form.*`, `albumForm.*`, `blogForm.*` and `chatRoomCard.*` are the form/card copy
 * sweep. They are still awaiting their `PortalResources.resx` entries, so every call site passes
 * the English string as the `t(key, fallback)` default (repo-wide convention) — the UI keeps
 * rendering English until the backend keys land, then picks up sk/cz automatically.
 */
export const gridBlockI18nKeys = {
	guest: {
		albums: 'gridBlocks.guest.albums',
		blogs: 'gridBlocks.guest.blogs',
		reels: 'gridBlocks.guest.reels',
		stories: 'gridBlocks.guest.stories',
		chatRooms: 'gridBlocks.guest.chatRooms',
		videoLounges: 'gridBlocks.guest.videoLounges',
		profiles: 'gridBlocks.guest.profiles',
		listings: 'gridBlocks.guest.listings',
	},
	loadError: {
		albums: 'gridBlocks.loadError.albums',
		blogs: 'gridBlocks.loadError.blogs',
		reels: 'gridBlocks.loadError.reels',
		stories: 'gridBlocks.loadError.stories',
		chatRooms: 'gridBlocks.loadError.chatRooms',
		videoLounges: 'gridBlocks.loadError.videoLounges',
		profiles: 'gridBlocks.loadError.profiles',
		listings: 'gridBlocks.loadError.listings',
		wallListings: 'gridBlocks.loadError.wallListings',
	},
	empty: {
		albumsFace: 'gridBlocks.empty.albumsFace',
		albums: 'gridBlocks.empty.albums',
		blogsFace: 'gridBlocks.empty.blogsFace',
		blogs: 'gridBlocks.empty.blogs',
		reels: 'gridBlocks.empty.reels',
		reelsAdd: 'gridBlocks.empty.reelsAdd',
		reelsCreate: 'gridBlocks.empty.reelsCreate',
		storiesActive: 'gridBlocks.empty.storiesActive',
		chatRooms: 'gridBlocks.empty.chatRooms',
		videoLounges: 'gridBlocks.empty.videoLounges',
		profilesFace: 'gridBlocks.empty.profilesFace',
		profilesDirectory: 'gridBlocks.empty.profilesDirectory',
		listings: 'gridBlocks.empty.listings',
		listingsWall: 'gridBlocks.empty.listingsWall',
	},
	selectFace: 'gridBlocks.selectFace',
	selectFaceProfiles: 'gridBlocks.selectFaceProfiles',
	profileCardRoleMember: 'gridBlocks.profile.cardRoleMember',
	profileRoleMember: 'gridBlocks.profile.roleMember',
	profileBioHint: 'gridBlocks.profile.bioHint',
	wallLabel: 'gridBlocks.wallLabel',
	loadingAria: 'gridBlocks.loadingAria',
	loadingEditor: 'gridBlocks.loadingEditor',
	formFacesLegend: 'gridBlocks.form.facesLegend',
	formNoFaces: 'gridBlocks.form.noFaces',
	/** Shared field labels and actions reused by every grid create/edit form. */
	form: {
		title: 'gridBlocks.form.title',
		description: 'gridBlocks.form.description',
		cancel: 'gridBlocks.form.cancel',
		create: 'gridBlocks.form.create',
		update: 'gridBlocks.form.update',
	},
	albumForm: {
		headingCreate: 'gridBlocks.form.album.headingCreate',
		headingEdit: 'gridBlocks.form.album.headingEdit',
		titlePlaceholder: 'gridBlocks.form.album.titlePlaceholder',
		descriptionPlaceholder: 'gridBlocks.form.album.descriptionPlaceholder',
		albumType: 'gridBlocks.form.album.albumType',
		mediaType: 'gridBlocks.form.album.mediaType',
		typePublic: 'gridBlocks.form.album.typePublic',
		typePrivate: 'gridBlocks.form.album.typePrivate',
		typePaid: 'gridBlocks.form.album.typePaid',
		mediaImage: 'gridBlocks.form.album.mediaImage',
		mediaVideo: 'gridBlocks.form.album.mediaVideo',
		saveError: 'gridBlocks.form.album.saveError',
	},
	blogForm: {
		headingCreate: 'gridBlocks.form.blog.headingCreate',
		headingEdit: 'gridBlocks.form.blog.headingEdit',
		titlePlaceholder: 'gridBlocks.form.blog.titlePlaceholder',
		face: 'gridBlocks.form.blog.face',
		selectFace: 'gridBlocks.form.blog.selectFace',
		content: 'gridBlocks.form.blog.content',
		contentPlaceholder: 'gridBlocks.form.blog.contentPlaceholder',
		imagesLegend: 'gridBlocks.form.blog.imagesLegend',
		imageUrlPlaceholder: 'gridBlocks.form.blog.imageUrlPlaceholder',
		saveError: 'gridBlocks.form.blog.saveError',
	},
	chatRoomCard: {
		badgeSystem: 'gridBlocks.chatRoomCard.badgeSystem',
		badgePublic: 'gridBlocks.chatRoomCard.badgePublic',
		badgePrivate: 'gridBlocks.chatRoomCard.badgePrivate',
		members: 'gridBlocks.chatRoomCard.members',
		lastActivity: 'gridBlocks.chatRoomCard.lastActivity',
	},
} as const;
