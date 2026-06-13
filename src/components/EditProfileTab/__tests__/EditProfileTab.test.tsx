// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditProfileTab } from '../EditProfileTab';

const useProfileMock = vi.fn();

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback ?? _key }),
}));
vi.mock('@/hooks/api/useProfileApi', () => ({ useProfile: () => useProfileMock() }));
vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({ user: { email: 'a@b.c', firstName: null, lastName: null }, token: 'tok' }),
}));
vi.mock('@/contexts/FaceConfigContext', () => ({
	useFaceConfig: () => ({
		selectedFace: null,
		availableFaces: [],
		selectFace: vi.fn(),
		reload: vi.fn(),
	}),
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/api/services/faceProfilesApi', () => ({ exitFace: vi.fn() }));

function profileState(overrides: Record<string, unknown> = {}) {
	return {
		profile: { firstName: 'John', lastName: 'Doe' },
		isLoading: false,
		updateProfile: vi.fn().mockResolvedValue(undefined),
		updateProfileLoading: false,
		uploadGlobalAvatar: vi.fn(),
		uploadGlobalLoading: false,
		uploadFaceAvatar: vi.fn(),
		uploadFaceLoading: false,
		refetch: vi.fn(),
		...overrides,
	};
}

describe('EditProfileTab name fields', () => {
	beforeEach(() => useProfileMock.mockReset());

	it('populates the name fields from the loaded profile', () => {
		useProfileMock.mockReturnValue(profileState());
		render(<EditProfileTab />);
		expect((screen.getByDisplayValue('John') as HTMLInputElement).value).toBe('John');
		expect((screen.getByDisplayValue('Doe') as HTMLInputElement).value).toBe('Doe');
	});

	it('lets the user clear the first-name field without it snapping back (regression)', () => {
		useProfileMock.mockReturnValue(profileState());
		render(<EditProfileTab />);

		const firstName = screen.getByDisplayValue('John') as HTMLInputElement;
		fireEvent.change(firstName, { target: { value: '' } });

		// Previously a render-phase resync restored "John" whenever the field was empty.
		expect(firstName.value).toBe('');
		// And it stays cleared across a re-render.
		fireEvent.blur(firstName);
		expect((screen.getByDisplayValue('Doe') as HTMLInputElement).value).toBe('Doe');
		expect(firstName.value).toBe('');
	});

	it('lets the user clear the last-name field too', () => {
		useProfileMock.mockReturnValue(profileState());
		render(<EditProfileTab />);

		const lastName = screen.getByDisplayValue('Doe') as HTMLInputElement;
		fireEvent.change(lastName, { target: { value: '' } });
		expect(lastName.value).toBe('');
	});

	it('lets the user clear BOTH name fields and keep them empty', () => {
		useProfileMock.mockReturnValue(profileState());
		render(<EditProfileTab />);

		const firstName = screen.getByDisplayValue('John') as HTMLInputElement;
		const lastName = screen.getByDisplayValue('Doe') as HTMLInputElement;
		fireEvent.change(firstName, { target: { value: '' } });
		fireEvent.change(lastName, { target: { value: '' } });

		expect(firstName.value).toBe('');
		expect(lastName.value).toBe('');
	});

	it('keeps a freshly typed value (does not revert to the profile value)', () => {
		useProfileMock.mockReturnValue(profileState());
		render(<EditProfileTab />);

		const firstName = screen.getByDisplayValue('John') as HTMLInputElement;
		fireEvent.change(firstName, { target: { value: 'Jane' } });
		expect(firstName.value).toBe('Jane');
	});

	it('falls back to the auth user names when no profile is loaded yet', () => {
		useProfileMock.mockReturnValue(profileState({ profile: undefined }));
		render(<EditProfileTab />);
		// useAuth mock provides null first/last names, so fields start empty and stay clearable.
		const firstName = screen.getByPlaceholderText('First name') as HTMLInputElement;
		expect(firstName.value).toBe('');
		fireEvent.change(firstName, { target: { value: 'Solo' } });
		expect(firstName.value).toBe('Solo');
	});
});
