import { useState } from 'react';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useAuth } from '../../../contexts/AuthContext';
import { createChatRoom } from '../../../api/services/ChatRoomsService';
import { Button } from '../../radix/Button';
import './ChatRoomForm.scss';

export interface ChatRoomFormProps {
	onSaved: (roomId: number) => void;
	onCancel: () => void;
}

export function ChatRoomForm({ onSaved, onCancel }: ChatRoomFormProps) {
	const { selectedFace } = useFaceConfig();
	const { token } = useAuth();
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [isPublic, setIsPublic] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedFace || !token || !title.trim()) return;
		setSaving(true);
		setError(null);
		try {
			const { id } = await createChatRoom(selectedFace.id, token, {
				title: title.trim(),
				description: description.trim() || null,
				isPublic,
			});
			onSaved(id);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create room');
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className="chatroom-form" onSubmit={handleSubmit}>
			<label className="chatroom-form-label">
				Title
				<input
					className="chatroom-form-input"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
					maxLength={200}
				/>
			</label>
			<label className="chatroom-form-label">
				Description
				<textarea
					className="chatroom-form-textarea"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={3}
					maxLength={2000}
				/>
			</label>
			<label className="chatroom-form-check">
				<input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
				Public room (anyone can join)
			</label>
			{error ? <p className="chatroom-form-error">{error}</p> : null}
			<div className="chatroom-form-actions">
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
