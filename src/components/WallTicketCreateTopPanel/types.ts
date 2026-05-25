export interface WallTicketCreateTopPanelProps {
	open: boolean;
	onClose: () => void;
	token: string;
	faceId: number;
	onCreated?: () => void;
}
