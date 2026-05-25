import type { BlogItem } from '../../../api/services/BlogsService';

export interface BlogFormProps {
	editBlog?: BlogItem | null;
	onSaved?: (blog: BlogItem) => void;
	onCancel?: () => void;
}
