import { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCircle, Upload, Loader2, LogOut } from 'lucide-react';
import { useProfile } from '@/hooks/api/useProfileApi';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { toast } from 'react-toastify';
import { exitFace } from '../../api/services/faceProfilesApi';
import './EditProfileTab.scss';

export function EditProfileTab() {
	const { t } = useTranslation('common');
	const { user, token } = useAuth();
	const { selectedFace, availableFaces, selectFace, reload } = useFaceConfig();
	const {
		profile,
		isLoading,
		updateProfile,
		updateProfileLoading,
		uploadGlobalAvatar,
		uploadGlobalLoading,
		uploadFaceAvatar,
		uploadFaceLoading,
		refetch,
	} = useProfile();

	const initialNames = useMemo(() => {
		if (profile) return { first: profile.firstName ?? '', last: profile.lastName ?? '' };
		if (user) return { first: user.firstName ?? '', last: user.lastName ?? '' };
		return { first: '', last: '' };
	}, [profile, user]);

	const [firstName, setFirstName] = useState(initialNames.first);
	const [lastName, setLastName] = useState(initialNames.last);
	// Once the user types into the name fields we never auto-overwrite them again. This lets the form
	// populate from the loaded profile/user, but also lets the user CLEAR a field and keep it cleared
	// (the previous render-phase resync snapped an emptied field back to the unsaved profile value).
	const nameFieldsEditedRef = useRef(false);
	const globalInputRef = useRef<HTMLInputElement>(null);
	const faceInputRef = useRef<HTMLInputElement>(null);
	const [exitFaceConfirming, setExitFaceConfirming] = useState(false);
	const [exitFaceLoading, setExitFaceLoading] = useState(false);

	const canExitFace = Boolean(
		selectedFace &&
		token &&
		selectedFace.myFaceRoleName &&
		selectedFace.myFaceRoleName !== 'FACE_HOST'
	);

	// Populate the fields when the source data changes (profile loads / user changes), but only until the
	// user has started editing — see nameFieldsEditedRef. This replaces a render-phase setState that resynced
	// whenever the field was empty, which made the field impossible to clear.
	useEffect(() => {
		if (nameFieldsEditedRef.current) return;
		setFirstName(initialNames.first);
		setLastName(initialNames.last);
	}, [initialNames]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await updateProfile({
				firstName: firstName.trim() || null,
				lastName: lastName.trim() || null,
			});
			toast.success(t('editProfile.saved', 'Profile saved'));
			refetch();
		} catch {
			toast.error(t('editProfile.saveError', 'Failed to save profile'));
		}
	};

	const handleGlobalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			toast.error(t('editProfile.invalidImage', 'Please choose an image file'));
			return;
		}
		try {
			await uploadGlobalAvatar(file);
			toast.success(t('editProfile.globalAvatarUploaded', 'Global avatar updated'));
			refetch();
		} catch {
			toast.error(t('editProfile.uploadError', 'Failed to upload avatar'));
		}
		e.target.value = '';
	};

	const handleFaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !selectedFace) return;
		if (!file.type.startsWith('image/')) {
			toast.error(t('editProfile.invalidImage', 'Please choose an image file'));
			return;
		}
		try {
			await uploadFaceAvatar(file);
			toast.success(t('editProfile.faceAvatarUploaded', 'Face avatar updated'));
			refetch();
		} catch {
			toast.error(t('editProfile.uploadError', 'Failed to upload avatar'));
		}
		e.target.value = '';
	};

	if (isLoading && !profile) {
		return (
			<div className="edit-profile-tab">
				<div className="edit-profile-tab__loading">
					<Loader2 size={24} className="spin" />
					<span>{t('editProfile.loading', 'Loading profile...')}</span>
				</div>
			</div>
		);
	}

	const globalUrl = profile?.globalAvatarUrl ?? null;
	const faceUrl = profile?.faceAvatarUrl ?? null;

	const handleExitFace = async () => {
		if (!selectedFace || !token) return;
		setExitFaceLoading(true);
		try {
			await exitFace(selectedFace.id, token);
			toast.dismiss();
			toast.success(t('exitFace.success'));
			setExitFaceConfirming(false);
			const basic = availableFaces.find((f) => f.index.toLowerCase() === 'basic');
			if (basic) selectFace(basic.id);
			await reload();
		} catch {
			toast.error(t('exitFace.error'));
		} finally {
			setExitFaceLoading(false);
		}
	};

	if (exitFaceConfirming && canExitFace) {
		return (
			<div className="edit-profile-tab">
				<div className="edit-profile-tab__exit-confirm">
					<h4 className="edit-profile-tab__section-title">{t('exitFace.confirmTitle')}</h4>
					<p className="edit-profile-tab__section-desc">{t('exitFace.confirmBody')}</p>
					<div className="edit-profile-tab__exit-actions">
						<button
							type="button"
							className="edit-profile-tab__exit-btn edit-profile-tab__exit-btn--danger"
							disabled={exitFaceLoading}
							onClick={() => void handleExitFace()}
						>
							{exitFaceLoading ? <Loader2 size={18} className="spin" /> : t('exitFace.yes')}
						</button>
						<button
							type="button"
							className="edit-profile-tab__exit-btn"
							disabled={exitFaceLoading}
							onClick={() => setExitFaceConfirming(false)}
						>
							{t('exitFace.no')}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="edit-profile-tab">
			<form onSubmit={handleSubmit} className="edit-profile-tab__form">
				<div className="edit-profile-tab__field">
					<label className="edit-profile-tab__label">
						{t('editProfile.firstName', 'First name')}
					</label>
					<input
						type="text"
						className="edit-profile-tab__input"
						value={firstName}
						onChange={(e) => {
							nameFieldsEditedRef.current = true;
							setFirstName(e.target.value);
						}}
						placeholder={t('editProfile.firstNamePlaceholder', 'First name')}
					/>
				</div>
				<div className="edit-profile-tab__field">
					<label className="edit-profile-tab__label">
						{t('editProfile.lastName', 'Last name')}
					</label>
					<input
						type="text"
						className="edit-profile-tab__input"
						value={lastName}
						onChange={(e) => {
							nameFieldsEditedRef.current = true;
							setLastName(e.target.value);
						}}
						placeholder={t('editProfile.lastNamePlaceholder', 'Last name')}
					/>
				</div>
				<button type="submit" className="edit-profile-tab__submit" disabled={updateProfileLoading}>
					{updateProfileLoading ? (
						<Loader2 size={18} className="spin" />
					) : (
						t('editProfile.save', 'Save name')
					)}
				</button>
			</form>

			<section className="edit-profile-tab__section">
				<h4 className="edit-profile-tab__section-title">
					{t('editProfile.globalAvatar', 'Global avatar')}
				</h4>
				<p className="edit-profile-tab__section-desc">
					{t(
						'editProfile.globalAvatarDesc',
						'Shown in every face when no face-specific avatar is set.'
					)}
				</p>
				<div className="edit-profile-tab__avatar-row">
					<div className="edit-profile-tab__avatar-preview">
						{globalUrl ? (
							<img src={globalUrl} alt="Global avatar" />
						) : (
							<UserCircle size={64} strokeWidth={1.5} />
						)}
					</div>
					<div className="edit-profile-tab__avatar-actions">
						<input
							ref={globalInputRef}
							type="file"
							accept="image/*"
							className="edit-profile-tab__file-input"
							onChange={handleGlobalFile}
						/>
						<button
							type="button"
							className="edit-profile-tab__upload-btn"
							disabled={uploadGlobalLoading}
							onClick={() => globalInputRef.current?.click()}
						>
							{uploadGlobalLoading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
							<span>{t('editProfile.upload', 'Upload')}</span>
						</button>
					</div>
				</div>
			</section>

			{selectedFace && (
				<section className="edit-profile-tab__section">
					<h4 className="edit-profile-tab__section-title">
						{t('editProfile.faceAvatar', 'Avatar for this face')} ({selectedFace.title})
					</h4>
					<p className="edit-profile-tab__section-desc">
						{t(
							'editProfile.faceAvatarDesc',
							'Used only in this face. If set, it overrides the global avatar here.'
						)}
					</p>
					<div className="edit-profile-tab__avatar-row">
						<div className="edit-profile-tab__avatar-preview">
							{faceUrl ? (
								<img src={faceUrl} alt="Face avatar" />
							) : (
								<UserCircle size={64} strokeWidth={1.5} />
							)}
						</div>
						<div className="edit-profile-tab__avatar-actions">
							<input
								ref={faceInputRef}
								type="file"
								accept="image/*"
								className="edit-profile-tab__file-input"
								onChange={handleFaceFile}
							/>
							<button
								type="button"
								className="edit-profile-tab__upload-btn"
								disabled={uploadFaceLoading}
								onClick={() => faceInputRef.current?.click()}
							>
								{uploadFaceLoading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
								<span>{t('editProfile.upload', 'Upload')}</span>
							</button>
						</div>
					</div>
				</section>
			)}

			{canExitFace && (
				<section className="edit-profile-tab__section edit-profile-tab__section--exit">
					<h4 className="edit-profile-tab__section-title">{t('exitFace.button')}</h4>
					<p className="edit-profile-tab__section-desc">{t('exitFace.hint')}</p>
					<button
						type="button"
						className="edit-profile-tab__exit-face-btn"
						onClick={() => setExitFaceConfirming(true)}
					>
						<LogOut size={18} />
						<span>{t('exitFace.button')}</span>
					</button>
				</section>
			)}
		</div>
	);
}
