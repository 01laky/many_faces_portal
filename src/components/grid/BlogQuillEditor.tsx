import { forwardRef, lazy, Suspense } from 'react';

const LazyReactQuill = lazy(async () => {
  await import('react-quill-new/dist/quill.snow.css');
  const m = await import('react-quill-new');
  return { default: m.default };
});

export interface BlogQuillEditorProps {
  theme: string;
  value: string;
  onChange: (value: string) => void;
  modules: Record<string, unknown>;
  formats: string[];
  placeholder?: string;
}

export const BlogQuillEditor = forwardRef<unknown, BlogQuillEditorProps>(function BlogQuillEditor(
  { theme, value, onChange, modules, formats, placeholder },
  ref
) {
  return (
    <Suspense fallback={<div className="blog-form-quill-loading">Loading editor…</div>}>
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
