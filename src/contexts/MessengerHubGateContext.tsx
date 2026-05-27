import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface MessengerHubGateContextValue {
	messengerTabActive: boolean;
	setMessengerTabActive: (active: boolean) => void;
}

const MessengerHubGateContext = createContext<MessengerHubGateContextValue | null>(null);

export function MessengerHubGateProvider({ children }: { children: ReactNode }) {
	const [messengerTabActive, setMessengerTabActive] = useState(false);
	const value = useMemo(
		() => ({ messengerTabActive, setMessengerTabActive }),
		[messengerTabActive]
	);
	return (
		<MessengerHubGateContext.Provider value={value}>{children}</MessengerHubGateContext.Provider>
	);
}

export function useMessengerHubGate(): MessengerHubGateContextValue {
	const ctx = useContext(MessengerHubGateContext);
	if (!ctx) {
		throw new Error('useMessengerHubGate must be used within MessengerHubGateProvider');
	}
	return ctx;
}
