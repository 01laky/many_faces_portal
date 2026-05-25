import type { ReelItem } from '../../../api/services/ReelsService';

export interface ReelFormProps {
	editReel?: ReelItem | null;
	onSaved?: (reel: ReelItem) => void;
	onCancel?: () => void;
}
