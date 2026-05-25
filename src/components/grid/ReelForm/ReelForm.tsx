import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import {
	createReel,
	updateReel,
	type ReelItem,
	type CreateReelDto,
} from '../../../api/services/ReelsService';
import { getSubmittedForApprovalCopy } from '../../../utils/contentModeration';
import '../AlbumForm/AlbumForm.scss';
import type { ReelFormProps } from './types';

export function ReelForm({ editReel, onSaved, onCancel }: ReelFormProps) {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { allFaces, selectedFace } = useFaceConfig();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [videoUrl, setVideoUrl] = useState('');
	const [selectedFaceIds, setSelectedFaceIds] = useState<number[]>([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const isEdit = !!editReel;

	useEffect(() => {
		void (async () => {
			await Promise.resolve();
			if (editReel) {
				setTitle(editReel.title);
				setDescription(editReel.description ?? '');
				setVideoUrl(editReel.videoUrl);
				setSelectedFaceIds(editReel.faces.map((f) => f.faceId));
			} else {
				setTitle('');
				setDescription('');
				setVideoUrl('');
				setSelectedFaceIds(selectedFace ? [selectedFace.id] : []);
			}
		})();
	}, [editReel, selectedFace]);

	const toggleFace = (faceId: number) => {
		setSelectedFaceIds((prev) =>
			prev.includes(faceId) ? prev.filter((id) => id !== faceId) : [...prev, faceId]
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!token || !title.trim() || !videoUrl.trim()) return;

		setSaving(true);
		setError('');
		setSuccess('');

		try {
			const dto: CreateReelDto = {
				title: title.trim(),
				description: description.trim() || undefined,
				videoUrl: videoUrl.trim(),
				faceIds: selectedFaceIds,
			};

			let result: ReelItem;
			if (isEdit) {
				result = await updateReel(editReel!.id, dto, token);
			} else {
				result = await createReel(dto, token);
				setSuccess(getSubmittedForApprovalCopy('reel'));
			}
			onSaved?.(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save reel');
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className="album-form" onSubmit={handleSubmit}>
			<h3 className="album-form-heading">{isEdit ? 'Edit Reel' : 'Create Reel'}</h3>

			{error && <div className="album-form-error">{error}</div>}
			{success && <div className="album-form-success">{success}</div>}

			<label className="album-form-label">
				Title
				<input
					type="text"
					className="album-form-input"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Reel title"
					maxLength={200}
					required
				/>
			</label>

			<label className="album-form-label">
				Description
				<textarea
					className="album-form-textarea"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Optional description"
					maxLength={2000}
					rows={3}
				/>
			</label>

			<label className="album-form-label">
				Video URL
				<input
					type="url"
					className="album-form-input"
					value={videoUrl}
					onChange={(e) => setVideoUrl(e.target.value)}
					placeholder="https://…"
					maxLength={1000}
					required
				/>
			</label>

			<fieldset className="album-form-fieldset">
				{<legend>{t(k.formFacesLegend)}</legend>}
				<p className="album-form-reel-faces-hint">
					Creating from a face page selects the current face by default. Select multiple faces only
					when this reel should be shared intentionally.
				</p>
				<div className="album-form-faces">
					{allFaces.map((face) => (
						<label key={face.id} className="album-form-face-option">
							<input
								type="checkbox"
								checked={selectedFaceIds.includes(face.id)}
								onChange={() => toggleFace(face.id)}
							/>
							<span>{face.title}</span>
						</label>
					))}
					{allFaces.length === 0 && <span className="album-form-no-faces">{t(k.formNoFaces)}</span>}
				</div>
			</fieldset>

			<div className="album-form-actions">
				{onCancel && (
					<button
						type="button"
						className="album-form-btn album-form-btn--cancel"
						onClick={onCancel}
					>
						Cancel
					</button>
				)}
				<button
					type="submit"
					className="album-form-btn album-form-btn--save"
					disabled={saving || !title.trim() || !videoUrl.trim()}
				>
					{saving ? <Loader2 size={16} className="album-form-spinner" /> : <Save size={16} />}
					<span>{isEdit ? 'Update' : 'Create'}</span>
				</button>
			</div>
		</form>
	);
}
