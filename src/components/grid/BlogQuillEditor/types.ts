export interface BlogQuillEditorProps {
	theme: string;
	value: string;
	onChange: (value: string) => void;
	modules: Record<string, unknown>;
	formats: string[];
	placeholder?: string;
}
