import type { ReactNode } from 'react';
import type { SupportedLanguage } from '../i18n/constants';
import type { PortalJwtUser } from '../utils/jwtUserFromToken';
import type { FaceConfig, FacesConfigResponse } from '../api/types/facesConfig';
import type { GridComponentType } from '../components/PageGridLayout';
import type { ApiClient } from '../api/ApiClient';

export interface AppContextType {
	currentLanguage: SupportedLanguage;
	changeLanguage: (lang: SupportedLanguage) => Promise<void>;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export interface AppProviderProps {
	children: ReactNode;
}

export type AuthUser = PortalJwtUser;

export interface AuthContextType extends AuthStateContextType, AuthActionsContextType {}

export interface AuthStateContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	/** True after the one-shot cold-start session read completes; stays true during login/logout. */
	isSessionHydrated: boolean;
	user: AuthUser | null;
	token: string | null;
}

export interface AuthActionsContextType {
	login: (
		username: string,
		password: string,
		options?: { rememberMe?: boolean }
	) => Promise<string | undefined>;
	logout: () => Promise<void>;
	refreshAuth: () => Promise<void>;
}

export interface AuthProviderProps {
	children: ReactNode;
}

export interface MeCapabilitiesWarmupProps {
	token: string | null;
}

export interface FaceConfigContextType {
	allFaces: FacesConfigResponse;
	publicFaces: FaceConfig[];
	privateFaces: FaceConfig[];
	availableFaces: FaceConfig[];
	selectedFace: FaceConfig | null;
	selectFace: (faceId: number) => void;
	isLoading: boolean;
	error: Error | null;
	reload: (authToken?: string | null) => Promise<FacesConfigResponse>;
	getFaceHomePath: () => string;
	getPostAuthHomePath: () => string;
}

export interface FaceConfigProviderProps {
	children: ReactNode;
}

export type MessengerConnectionState = 'Connecting' | 'Connected' | 'Disconnected';

export interface MessengerContextValue {
	connectionState: MessengerConnectionState;
	sendMessage: (receiverId: string, content: string) => Promise<void>;
	acceptMessageRequest: (senderId: string) => Promise<void>;
	rejectMessageRequest: (senderId: string) => Promise<void>;
	onChatMessage: (
		cb: (
			senderId: string,
			senderName: string,
			content: string,
			sentAt: string,
			messageId: number
		) => void
	) => () => void;
	onMessageRequest: (
		cb: (senderId: string, senderName: string, content: string, sentAt: string) => void
	) => () => void;
	onFriendRequest: (cb: (senderId: string, senderName: string) => void) => () => void;
	onMessageRequestAccepted: (cb: (accepterId: string, accepterName: string) => void) => () => void;
	onMessageRequestRejected: (cb: (rejecterId: string) => void) => () => void;
	onNotification: (
		cb: (id: number, title: string, message: string, type: string, createdAt: string) => void
	) => () => void;
	onPlatformChatError: (cb: (code: string) => void) => () => void;
}

export interface MessengerProviderProps {
	token: string | null;
	children: ReactNode;
	/** When false, hub lifecycle is skipped (PT-RP9). Default true. */
	messengerEnabled?: boolean;
}

export type GridTopPanelState = null | { mode: 'create'; componentType: GridComponentType };

export type GridTopPanelContextValue = {
	gridTopPanel: GridTopPanelState;
	openGridCreate: (componentType: GridComponentType) => void;
	closeGridPanel: () => void;
};

export interface GridTopPanelProviderProps {
	children: ReactNode;
	value: GridTopPanelContextValue;
}

export interface TApiContextModel {
	api: ApiClient;
}

export interface TApiContextProviderProps {
	children: ReactNode;
	accessToken?: string | null;
}

export interface GradientAnimationPreferenceContextValue {
	/** Effective flag after reduced-motion override. */
	animationEnabled: boolean;
	/** Raw user preference before reduced-motion override. */
	userWantsAnimation: boolean;
	prefersReducedMotion: boolean;
	setAnimationEnabled: (enabled: boolean) => Promise<void>;
	isUpdating: boolean;
}

export interface GradientAnimationPreferenceProviderProps {
	children: ReactNode;
}
