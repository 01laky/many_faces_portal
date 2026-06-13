import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Plus, X } from 'lucide-react';
import { BlogQuillEditor } from '../BlogQuillEditor';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import {
	createBlog,
	updateBlog,
	type BlogItem,
	type CreateBlogDto,
} from '../../../api/services/BlogsService';
import { getSubmittedForApprovalCopy } from '../../../utils/contentModeration';
import { sanitizeBlogHtml } from '../../../utils/blogHtmlSecurity';
import { sanitizeMediaUrl } from '../../../utils/safeUrl';
import './BlogForm.scss';
import type { BlogFormProps } from './types';
import { MAX_IMAGES, QUILL_FORMATS, QUILL_MODULES } from './constants';

export function BlogForm({ editBlog, onSaved, onCancel }: BlogFormProps) {
	const { token } = useAuth();
	const { allFaces, selectedFace } = useFaceConfig();
	const quillRef = useRef<unknown>(null);

	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [faceId, setFaceId] = useState<number>(0);
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [newImageUrl, setNewImageUrl] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const isEdit = !!editBlog;

	useEffect(() => {
		void (async () => {
			await Promise.resolve();
			if (editBlog) {
				setTitle(editBlog.title);
				setContent(editBlog.content);
				setFaceId(editBlog.faceId);
				setImageUrls(editBlog.images.map((img) => img.imageUrl));
			} else {
				setTitle('');
				setContent('');
				setFaceId(selectedFace?.id ?? 0);
				setImageUrls([]);
			}
		})();
	}, [editBlog, selectedFace]);

	const addImage = () => {
		const url = sanitizeMediaUrl(newImageUrl.trim());
		if (!url || imageUrls.length >= MAX_IMAGES) return;
		setImageUrls((prev) => [...prev, url]);
		setNewImageUrl('');
	};

	const removeImage = (index: number) => {
		setImageUrls((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!token || !title.trim() || !content.trim() || !faceId) return;

		setSaving(true);
		setError('');
		setSuccess('');

		try {
			const dto: CreateBlogDto = {
				title: title.trim(),
				content: sanitizeBlogHtml(content.trim()),
				faceId,
				imageUrls:
					imageUrls.length > 0
						? imageUrls.map((u) => sanitizeMediaUrl(u)).filter(Boolean)
						: undefined,
			};

			let result: BlogItem;
			if (isEdit) {
				result = await updateBlog(editBlog!.id, dto, token);
			} else {
				result = await createBlog(dto, token);
				setSuccess(getSubmittedForApprovalCopy('blog'));
			}
			onSaved?.(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save blog');
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className="blog-form" onSubmit={handleSubmit}>
			<h3 className="blog-form-heading">{isEdit ? 'Edit Blog' : 'Create Blog'}</h3>

			{error && <div className="blog-form-error">{error}</div>}
			{success && <div className="blog-form-success">{success}</div>}

			<label className="blog-form-label">
				Title
				<input
					type="text"
					className="blog-form-input"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Blog title"
					maxLength={200}
					required
				/>
			</label>

			<label className="blog-form-label">
				Face
				<select
					className="blog-form-select"
					value={faceId}
					onChange={(e) => setFaceId(Number(e.target.value))}
					required
				>
					<option value={0} disabled>
						Select face
					</option>
					{allFaces.map((face) => (
						<option key={face.id} value={face.id}>
							{face.title}
						</option>
					))}
				</select>
			</label>

			<div className="blog-form-label">
				Content
				<div className="blog-form-editor-wrapper">
					<BlogQuillEditor
						ref={quillRef}
						theme="snow"
						value={content}
						onChange={setContent}
						modules={QUILL_MODULES}
						formats={QUILL_FORMATS}
						placeholder="Write your blog content..."
					/>
				</div>
			</div>

			<fieldset className="blog-form-fieldset">
				<legend>Images (max {MAX_IMAGES})</legend>
				<div className="blog-form-images">
					{imageUrls.map((url, i) => (
						<div key={url} className="blog-form-image-item">
							<span className="blog-form-image-url" title={url}>
								{url.length > 40 ? url.slice(0, 40) + '…' : url}
							</span>
							<button
								type="button"
								className="blog-form-image-remove"
								onClick={() => removeImage(i)}
							>
								<X size={14} />
							</button>
						</div>
					))}
					{imageUrls.length < MAX_IMAGES && (
						<div className="blog-form-image-add">
							<input
								type="text"
								className="blog-form-input"
								value={newImageUrl}
								onChange={(e) => setNewImageUrl(e.target.value)}
								placeholder="Image URL"
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addImage();
									}
								}}
							/>
							<button
								type="button"
								className="blog-form-btn blog-form-btn--add-image"
								onClick={addImage}
								disabled={!newImageUrl.trim()}
							>
								<Plus size={14} />
							</button>
						</div>
					)}
				</div>
			</fieldset>

			<div className="blog-form-actions">
				{onCancel && (
					<button type="button" className="blog-form-btn blog-form-btn--cancel" onClick={onCancel}>
						Cancel
					</button>
				)}
				<button
					type="submit"
					className="blog-form-btn blog-form-btn--save"
					disabled={saving || !title.trim() || !content.trim() || !faceId}
				>
					{saving ? <Loader2 size={16} className="blog-form-spinner" /> : <Save size={16} />}
					<span>{isEdit ? 'Update' : 'Create'}</span>
				</button>
			</div>
		</form>
	);
}
