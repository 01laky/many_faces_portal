import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { createStoryDraft, publishStory, uploadStoryImage } from '../../api/services/storiesApi';
import './StoriesCreateTopPanel.scss';
import type { StoriesCreateTopPanelProps } from './types';

export function StoriesCreateTopPanel({ open, onClose, token }: StoriesCreateTopPanelProps) {
	const { t } = useTranslation('common');
	const { availableFaces, selectedFace } = useFaceConfig();
	const [title, setTitle] = useState('');
	const [files, setFiles] = useState<File[]>([]);
	const [scheduleAt, setScheduleAt] = useState('');
	const [selectedFaceIds, setSelectedFaceIds] = useState<number[]>([]);
	const [allFaces, setAllFaces] = useState(true);
	const [saving, setSaving] = useState(false);

	if (!open) return null;

	const toggleFace = (id: number) => {
		setAllFaces(false);
		setSelectedFaceIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error(t('stories.titleRequired'));
			return;
		}
		if (files.length === 0 || files.length > 10) {
			toast.error(t('stories.imagesRequired'));
			return;
		}
		setSaving(true);
		try {
			const faceIds = allFaces || selectedFaceIds.length === 0 ? undefined : selectedFaceIds;
			const { id: storyId } = await createStoryDraft(token, {
				title: title.trim(),
				faceIds,
			});
			for (let i = 0; i < files.length; i++) {
				await uploadStoryImage(token, storyId, files[i], i);
			}
			let scheduled: string | null = null;
			if (scheduleAt.trim()) {
				const d = new Date(scheduleAt);
				if (!Number.isNaN(d.getTime()) && d > new Date()) {
					scheduled = d.toISOString();
				}
			}
			await publishStory(token, storyId, scheduled);
			toast.success(t('stories.publishSuccess'));
			setTitle('');
			setFiles([]);
			setScheduleAt('');
			setSelectedFaceIds([]);
			setAllFaces(true);
			onClose();
		} catch {
			toast.error(t('stories.publishError'));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="stories-create-top-panel" role="dialog" aria-modal="true">
			<div className="stories-create-top-panel__inner">
				<div className="stories-create-top-panel__head">
					<h2>{t('stories.newStory')}</h2>
					<button type="button" className="stories-create-top-panel__close" onClick={onClose}>
						<X size={22} />
					</button>
				</div>
				<form onSubmit={(e) => void handleSubmit(e)} className="stories-create-top-panel__form">
					<label className="stories-create-top-panel__field">
						<span>{t('stories.title')}</span>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={200}
						/>
					</label>
					<label className="stories-create-top-panel__field">
						<span>{t('stories.imagesUpTo10')}</span>
						<input
							type="file"
							accept="image/*"
							multiple
							onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 10))}
						/>
					</label>
					<label className="stories-create-top-panel__field">
						<span>{t('stories.scheduleOptional')}</span>
						<input
							type="datetime-local"
							value={scheduleAt}
							onChange={(e) => setScheduleAt(e.target.value)}
						/>
					</label>
					<fieldset className="stories-create-top-panel__faces">
						<legend>{t('stories.facesLegend')}</legend>
						<label>
							<input
								type="checkbox"
								checked={allFaces}
								onChange={() => {
									setAllFaces(true);
									setSelectedFaceIds([]);
								}}
							/>
							{t('stories.allFaces')}
						</label>
						{!allFaces &&
							availableFaces.map((f) => (
								<label key={f.id}>
									<input
										type="checkbox"
										checked={selectedFaceIds.includes(f.id)}
										onChange={() => toggleFace(f.id)}
									/>
									{f.title} ({f.index})
								</label>
							))}
						{allFaces && selectedFace && (
							<p className="stories-create-top-panel__muted">{t('stories.allFacesHelp')}</p>
						)}
					</fieldset>
					<button type="submit" className="stories-create-top-panel__submit" disabled={saving}>
						{saving ? <Loader2 size={18} className="spin" /> : t('stories.submit')}
					</button>
				</form>
			</div>
		</div>
	);
}
