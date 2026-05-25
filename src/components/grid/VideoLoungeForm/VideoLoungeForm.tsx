import { useState } from 'react';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useAuth } from '../../../contexts/AuthContext';
import { createVideoLounge } from '../../../api/services/VideoLoungesService';
import { Button } from '../../radix/Button';
import './VideoLoungeForm.scss';
import type { VideoLoungeFormProps } from './types';

export function VideoLoungeForm({ onSaved, onCancel }: VideoLoungeFormProps) {
	const { selectedFace } = useFaceConfig();
	const { token } = useAuth();
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [isPublic, setIsPublic] = useState(true);
	const [maxParticipants, setMaxParticipants] = useState(10);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedFace || !token || !title.trim()) return;
		setSaving(true);
		setError(null);
		try {
			const { id } = await createVideoLounge(selectedFace.id, token, {
				title: title.trim(),
				description: description.trim() || null,
				isPublic,
				maxParticipants,
			});
			onSaved(id);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create lounge');
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className="videolounge-form" onSubmit={handleSubmit}>
			<label className="videolounge-form-label">
				Title
				<input
					className="videolounge-form-input"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
					maxLength={200}
				/>
			</label>
			<label className="videolounge-form-label">
				Description
				<textarea
					className="videolounge-form-textarea"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={3}
					maxLength={2000}
				/>
			</label>
			<label className="videolounge-form-label">
				Max participants
				<input
					type="number"
					className="videolounge-form-input"
					min={2}
					max={50}
					value={maxParticipants}
					onChange={(e) => setMaxParticipants(Number(e.target.value))}
				/>
			</label>
			<label className="videolounge-form-check">
				<input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
				Public lounge (anyone can join)
			</label>
			{error ? <p className="videolounge-form-error">{error}</p> : null}
			<div className="videolounge-form-actions">
				<Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
					Cancel
				</Button>
				<Button type="submit" disabled={saving || !title.trim()}>
					{saving ? 'Creating…' : 'Create'}
				</Button>
			</div>
		</form>
	);
}
