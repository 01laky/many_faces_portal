export interface HeaderProps {
	onSettingsToggle?: () => void;
	onMenuToggle?: () => void;
	/** When provided, clicking the profile area opens the slide-out panel with Edit profile tab selected */
	onProfileClick?: () => void;
	/** Open top panel to create a new story */
	onStoriesCreate?: () => void;
	/** Open top panel to create a wall ticket (face wall page) */
	onWallTicketCreate?: () => void;
}
