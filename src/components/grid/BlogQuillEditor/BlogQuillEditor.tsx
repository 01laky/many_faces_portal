import { forwardRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import type { BlogQuillEditorProps } from './types';

const LazyReactQuill = lazy(async () => {
	await import('react-quill-new/dist/quill.snow.css');
	const m = await import('react-quill-new');
	return { default: m.default };
});

export const BlogQuillEditor = forwardRef<unknown, BlogQuillEditorProps>(function BlogQuillEditor(
	{ theme, value, onChange, modules, formats, placeholder },
	ref
) {
	const { t } = useTranslation('common');
	return (
		<Suspense fallback={<div className="blog-form-quill-loading">{t(k.loadingEditor)}</div>}>
			<LazyReactQuill
				ref={ref as never}
				theme={theme}
				value={value}
				onChange={onChange}
				modules={modules}
				formats={formats}
				placeholder={placeholder}
			/>
		</Suspense>
	);
});
