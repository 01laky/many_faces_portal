import type { FaceConfig } from '../../api/types/facesConfig';

export interface FaceRoleSelectPanelProps {
	/** Current private face */
	face: FaceConfig;
	token: string;
	onRoleSet: () => void;
	/** When true, rendered inside slide-out panel (lighter styling) */
	inPanel?: boolean;
}
