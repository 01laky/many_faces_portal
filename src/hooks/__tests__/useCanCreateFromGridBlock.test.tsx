/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCanCreateFromGridBlock } from '@/hooks/useCanCreateFromGridBlock';

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: vi.fn(() => ({ token: 'jwt', isAuthenticated: true })),
}));

vi.mock('@/contexts/FaceConfigContext', () => ({
	useFaceConfig: vi.fn(() => ({
		selectedFace: {
			id: 1,
			myFaceRoleName: 'FACE_MEMBER',
			chatRoomsCreate: true,
			videoLoungesCreate: true,
		},
	})),
}));

vi.mock('@/hooks/api/useMeCapabilities', () => ({
	useMeCapabilities: vi.fn(() => ({
		data: {
			globalRole: 'user',
			requestFaceId: 1,
			requestFaceIndex: 'demo',
			isAdminFaceScope: false,
			myFaceRoleName: 'FACE_MEMBER',
			permissions: ['tenant:session', 'face:member'],
		},
	})),
}));

function wrapper() {
	const client = new QueryClient();
	return function W({ children }: { children: React.ReactNode }) {
		return React.createElement(QueryClientProvider, { client }, children);
	};
}

describe('useCanCreateFromGridBlock (PT-RP28)', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		const { useAuth } = await import('@/contexts/AuthContext');
		vi.mocked(useAuth).mockReturnValue({
			token: 'jwt',
			isAuthenticated: true,
		} as ReturnType<typeof useAuth>);
		const { useFaceConfig } = await import('@/contexts/FaceConfigContext');
		vi.mocked(useFaceConfig).mockReturnValue({
			selectedFace: {
				id: 1,
				myFaceRoleName: 'FACE_MEMBER',
				chatRoomsCreate: true,
				videoLoungesCreate: true,
			},
		} as ReturnType<typeof useFaceConfig>);
		const { useMeCapabilities } = await import('@/hooks/api/useMeCapabilities');
		vi.mocked(useMeCapabilities).mockReturnValue({
			data: {
				globalRole: 'user',
				requestFaceId: 1,
				requestFaceIndex: 'demo',
				isAdminFaceScope: false,
				myFaceRoleName: 'FACE_MEMBER',
				permissions: ['tenant:session', 'face:member'],
			},
		} as ReturnType<typeof useMeCapabilities>);
	});

	it('PT-RP28-U2: album grid can create for face member', () => {
		const { result } = renderHook(() => useCanCreateFromGridBlock('albumGrid'), {
			wrapper: wrapper(),
		});
		expect(result.current.canCreate).toBe(true);
		expect(result.current.reason).toBe('ok');
	});

	it('PT-RP28-U2b: ad grid unsupported', () => {
		const { result } = renderHook(() => useCanCreateFromGridBlock('adGrid'), {
			wrapper: wrapper(),
		});
		expect(result.current.canCreate).toBe(false);
		expect(result.current.reason).toBe('unsupported');
	});

	it('PT-RP28-U2c: chat room blocked for host role', async () => {
		const { useFaceConfig } = await import('@/contexts/FaceConfigContext');
		vi.mocked(useFaceConfig).mockReturnValue({
			selectedFace: {
				id: 1,
				myFaceRoleName: 'FACE_HOST',
				chatRoomsCreate: true,
				videoLoungesCreate: true,
			},
		} as ReturnType<typeof useFaceConfig>);
		const { result } = renderHook(() => useCanCreateFromGridBlock('chatRoomGrid'), {
			wrapper: wrapper(),
		});
		expect(result.current.canCreate).toBe(false);
		expect(result.current.reason).toBe('host');
	});

	it('PT-RP28-U1: guest cannot create', async () => {
		const { useAuth } = await import('@/contexts/AuthContext');
		vi.mocked(useAuth).mockReturnValue({
			token: null,
			isAuthenticated: false,
		} as ReturnType<typeof useAuth>);
		const { result } = renderHook(() => useCanCreateFromGridBlock('albumGrid'), {
			wrapper: wrapper(),
		});
		expect(result.current.reason).toBe('guest');
	});

	it('PT-RP28-U3: video lounge blocked when face flag off', async () => {
		const { useFaceConfig } = await import('@/contexts/FaceConfigContext');
		vi.mocked(useFaceConfig).mockReturnValue({
			selectedFace: {
				id: 1,
				myFaceRoleName: 'FACE_MEMBER',
				chatRoomsCreate: true,
				videoLoungesCreate: false,
			},
		} as ReturnType<typeof useFaceConfig>);
		const { result } = renderHook(() => useCanCreateFromGridBlock('videoLoungeGrid'), {
			wrapper: wrapper(),
		});
		expect(result.current.canCreate).toBe(false);
		expect(result.current.reason).toBe('faceFlag');
	});

	it('PT-RP28-U4: album blocked without face:member ACL', async () => {
		const { useMeCapabilities } = await import('@/hooks/api/useMeCapabilities');
		vi.mocked(useMeCapabilities).mockReturnValue({
			data: {
				globalRole: 'user',
				requestFaceId: 1,
				requestFaceIndex: 'demo',
				isAdminFaceScope: false,
				myFaceRoleName: 'FACE_MEMBER',
				permissions: ['tenant:session'],
			},
		} as ReturnType<typeof useMeCapabilities>);
		const { result } = renderHook(() => useCanCreateFromGridBlock('albumGrid'), {
			wrapper: wrapper(),
		});
		expect(result.current.canCreate).toBe(false);
		expect(result.current.reason).toBe('acl');
	});
});
