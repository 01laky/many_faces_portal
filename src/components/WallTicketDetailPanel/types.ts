export interface WallTicketDetailPanelProps {
	open: boolean;
	onClose: () => void;
	token: string;
	faceId: number;
	ticketId: number | null;
	onChanged?: () => void;
}
